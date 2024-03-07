import {
  BadRequestException,
  ConsoleLogger,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DepoDto, RequestDoDto, UpdateDoSLDto } from './dto/create-do.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  StatusDo,
  td_do_dok_form,
  td_do_invoice_form,
  td_do_kontainer_form,
  td_do_nonkontainer_form,
  td_do_vin,
} from '@prisma/client';
import * as moment from 'moment-timezone';
import { UserService } from 'src/user/user.service';
import { generateNoReq, getLocalTimeZone, validateError } from 'src/util';
import { ShippinglineService } from 'src/referensi/shippingline/shippingline.service';
import { DepoService } from 'src/referensi/depo/depo.service';
import { SmartContractService } from 'src/smart-contract/smart-contract.service';

@Injectable()
export class DeliveryOrderService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private shippinglineService: ShippinglineService,
    private depoService: DepoService,
    private smartContractService: SmartContractService,
  ) {}

  async getAllDoCo(coName: string) {
    let dataSubmitted = [];
    const timezone = getLocalTimeZone();

    const data = await this.prisma.td_reqdo_header_form.findMany({
      include: {
        td_do_bl_form: {
          select: {
            no_bl: true,
            tgl_bl: true,
          },
        },
        td_do_requestor_form: {
          select: {
            nama: true,
          },
        },
        td_do_req_form: {
          select: {
            id_shippingline: true,
          },
        },
        td_parties_detail_form: {
          select: {
            id_port_discharge: true,
          },
        },
        td_reqdo_status: {
          select: {
            name: true,
          },
          orderBy: {
            datetime_status: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    let dataDraft = data
      .filter(
        (item) =>
          item.created_by === coName &&
          item.td_reqdo_status[0].name === 'Draft',
      )
      .map((item) => ({
        id: item.id,
        orderId: item.order_id,
        requestNumber: item.no_reqdo,
        requestTime: moment(item.tgl_reqdo)
          .tz(timezone)
          .format('DD-MM-YYYY HH:mm:ss'),
        blNumber: item.td_do_bl_form.no_bl,
        blDate: item.td_do_bl_form.tgl_bl
          ? moment(item.td_do_bl_form.tgl_bl).format('DD-MM-YYYY')
          : null,
        requestName: item.td_do_requestor_form.nama,
        shippingLine: item.td_do_req_form.id_shippingline.split('|')[0].trim(),
        status: item.td_reqdo_status[0].name,
        isContainer: item.request_type == 1,
      }));

    for (const item of (await this.smartContractService.getAllDoCo(coName))
      .data) {
      // get header data by order id
      const headerData = await this.prisma.td_reqdo_header_form.findFirst({
        where: {
          order_id: item.Record.orderId,
        },
      });
      if (!headerData) {
        throw new NotFoundException(
          `Header data by orderId = ${item.Record.orderId} not found`,
        );
      }
      dataSubmitted.push({
        id: headerData.id,
        orderId: item.Record.orderId,
        requestNumber: item.Record.requestDetail.requestDoNumber,
        requestTime: moment(headerData.tgl_reqdo)
          .tz(timezone)
          .format('DD-MM-YYYY HH:mm:ss'),
        blNumber: item.Record.requestDetail.document.ladingBillNumber,
        blDate: item.Record.requestDetail.document.ladingBillDate
          ? moment(item.Record.requestDetail.document.ladingBillDate).format(
              'DD-MM-YYYY',
            )
          : null,
        requestName: item.Record.requestDetail.requestor.requestorName,
        shippingLine: item.Record.requestDetail.shippingLine.shippingType
          .split('|')[0]
          .trim(),
        status: item.Record.status,
        isContainer: item.Record.requestType == 1,
      });
    }
    // merge data draft and data submitted
    const dataDoCo = dataDraft.concat(dataSubmitted).sort((b, a) => {
      return a.requestTime.localeCompare(b.requestTime);
    });
    return dataDoCo;
  }

  async getAllDoSL(slName: string, kodeDetailGa: string, token: string) {
    let dataDoSL = [];
    const timezone = getLocalTimeZone();
    // get list of shippingline codes that by kode detail ga
    const listKodeSL = (await this.shippinglineService.findAll(token)).data
      .filter((item) => item.kd_detail_ga === kodeDetailGa)
      .map((item) => item.kode);
    // console.log(listKodeSL);
    for (const item of (
      await this.smartContractService.getAllDoSL(slName, listKodeSL)
    ).data) {
      // get header data by order id
      const headerData = await this.prisma.td_reqdo_header_form.findFirst({
        where: {
          order_id: item.Record.orderId,
        },
      });
      if (!headerData) {
        throw new NotFoundException(
          `DO data by order_id = ${item.Record.orderId} not found!`,
        );
      }
      dataDoSL.push({
        id: headerData.id,
        orderId: item.Record.orderId,
        requestNumber: item.Record.requestDetail.requestDoNumber,
        requestTime: moment(headerData.tgl_reqdo)
          .tz(timezone)
          .format('DD-MM-YYYY HH:mm:ss'),
        blNumber: item.Record.requestDetail.document.ladingBillNumber,
        blDate: item.Record.requestDetail.document.ladingBillDate
          ? moment(item.Record.requestDetail.document.ladingBillDate)
              .tz(timezone)
              .format('DD-MM-YYYY')
          : null,
        requestName: item.Record.requestDetail.requestor.requestorName,
        shippingLine: item.Record.requestDetail.shippingLine.shippingType
          .split('|')[0]
          .trim(),
        status: item.Record.status,
        isContainer: item.Record.requestType == 1,
      });
    }
    return dataDoSL.sort((b, a) => {
      return a.requestTime.localeCompare(b.requestTime);
    });
  }

  async getDoDetail(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);
    // get header data by idDo
    const headerData = await this.getHeaderData(idDo);
    // get last status DO
    const lastStatus = (await this.getAllStatus(+idDo)).data.pop().status;
    // CASE 1 : IF LAST STATUS IS NOT DRAFT, GET DO DETAIL FROM SMART CONTRACT
    if (lastStatus !== 'Draft') {
      const response = await this.getDoDetailSC(
        userInfo.sub,
        headerData.order_id,
      );
      return response;
    }
    // CASE 2 : IF LAST STATUS IS DRAFT, GET DO DETAIL FROM DB
    const response = await this.getDoDetailDraft(idDo);
    return response;
  }

  async deleteDo(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);
    // CHECK IF USER ROLE IS CO OR SL
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException('Failed to delete DO, Role is not CO');
    }

    const data = await this.prisma.td_reqdo_header_form.findUnique({
      where: {
        id: idDo,
      },
    });
    if (!data) {
      throw new NotFoundException(`DO data by id = ${idDo} not found`);
    }

    // check if status is draft
    const statusDO = (await this.getAllStatus(data.id)).data.pop().status;
    if (statusDO !== 'Draft') {
      throw new BadRequestException(
        'Cannot delete DO, status DO is not Draft!',
      );
    }

    const deleted = await this.prisma.td_reqdo_header_form.delete({
      where: {
        id: idDo,
      },
    });
    return {
      message: 'success',
      data: deleted,
    };
  }

  // CREATE KONTAINER
  async createKontainer(data: RequestDoDto, token: string, status?: StatusDo) {
    const userInfo = await this.userService.getDetail(token);
    const created_by = userInfo.sub;

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot create DO container, Role is not CO',
      );
    }

    // CHECK IF REQUEST TYPE = 1
    if (data.requestType !== 1) {
      throw new BadRequestException(
        'Tidak dapat melakukan create DO kontainer, requestType != 1',
      );
    }

    // CHECK IF USER IS FF AND SURAT KUASA EXIST
    if (
      data.requestDetail.requestor.requestorType == '2' &&
      !data.requestDetail.requestor.urlFile
    ) {
      throw new BadRequestException('Freight Forwarder required surat kuasa');
    }

    // CHECK IF STATUS REQDO Draft or Submitted
    if (!['Draft', 'Submitted'].includes(status)) {
      throw new BadRequestException(
        'Status DO of Create DO must be Draft or Submitted',
      );
    }

    // CASE 1: IF SUBMITTED, SEND PAYLOAD TO SMART CONTRACT
    if (status === 'Submitted') {
      data.requestDetail.requestorId = userInfo.sub;
      data.requestDetail.requestDoNumber = generateNoReq(
        data.requestDetail.shippingLine.shippingType.split('|')[0].trim(),
      );
      const result = await this.smartContractService.requestDO(data, status);
      // generate status do to smart contract
      const headerDo = await this.prisma.td_reqdo_header_form.create({
        data: {
          order_id: result.response.orderId,
          request_type: data.requestType,
          no_reqdo: data.requestDetail.requestDoNumber,
          created_by: data.requestDetail.requestorId,
          td_reqdo_status: {
            create: {
              name: result.response.status,
              datetime_status: new Date(result.response.datetime),
            },
          },
        },
      });
      return {
        result,
        data: headerDo,
      };
    }

    // CASE 2: IF DRAFT, SAVE TO RELATIONAL DATABASE
    const dataDokumen = data.supportingDocument.documentType.map((item) => {
      const data: Partial<td_do_dok_form> = {
        created_by,
        id_jenis_dok: item.document,
        filepath_dok: item.urlFile,
        no_dok: item.documentNo,
        tgl_dok: new Date(item.documentDate),
      };

      return data;
    });

    const dataInvoice = data.paymentDetail.invoice.map((item) => {
      const data: Partial<td_do_invoice_form> = {
        created_by,
        filepath_buktibayar: item.urlFile,
        id_bank: item.bankId,
        no_invoice: item.invoiceNo,
        tgl_invoice: new Date(item.invoiceDate),
        no_rekening: item.accountNo,
        total_payment: item.totalAmount,
        id_currency: item.currency, //TODO: ADD CURRENCY JSON
      };

      return data;
    });

    const createdDo = await this.prisma.td_reqdo_header_form.create({
      data: {
        request_type: data.requestType,
        order_id: crypto.randomUUID(),
        no_reqdo: generateNoReq(
          data.requestDetail.shippingLine.shippingType.split('|')[0].trim(),
        ),
        created_by,
        td_do_requestor_form: {
          create: {
            id_jenis_requestor: +data.requestDetail.requestor.requestorType,
            alamat: data.requestDetail.requestor.requestorAddress,
            created_by,
            nama: data.requestDetail.requestor.requestorName,
            nib: data.requestDetail.requestor.nib,
            npwp: data.requestDetail.requestor.npwp,
            filepath_suratkuasa: data.requestDetail.requestor.urlFile,
          },
        },
        td_do_bl_form: {
          create: {
            created_by,
            filepath_dok: data.requestDetail.document.urlFile,
            id_jenis_bl: data.requestDetail.document.ladingBillType,
            no_bl: data.requestDetail.document.ladingBillNumber,
            tgl_bl: new Date(data.requestDetail.document.ladingBillDate),
          },
        },
        td_do_req_form: {
          create: {
            created_by,
            id_metode_bayar: +data.requestDetail.payment,
            id_shippingline: data.requestDetail.shippingLine.shippingType,
            nama_vessel: data.requestDetail.shippingLine.vesselName,
            no_voyage: data.requestDetail.shippingLine.voyageNumber,
            pos_number: data.requestDetail.document.posNumber,
            tgl_reqdo_exp: new Date(data.requestDetail.shippingLine.doExpired),
            no_bc11: data.requestDetail.document.bc11Number,
            tanggal_bc11: data.requestDetail.document.bc11Date
              ? new Date(data.requestDetail.document.bc11Date)
              : null,
          },
        },

        td_parties_detail_form: {
          create: {
            created_by,
            id_negara_loading: data.location.locationType[0].countryCode,
            id_port_loading: data.location.locationType[0].portCode,
            id_port_discharge: data.location.locationType[1].portCode,
            id_port_destination: data.location.locationType[2].portCode,
            nama_consignee: data.parties.consignee.name,
            nama_notifyparty: data.parties.notifyParty.name,
            nama_shipper: data.parties.shipper.name,
            npwp_consignee: data.parties.shipper.npwp,
            npwp_notifyparty: data.parties.notifyParty.npwp,
          },
        },
        td_do_dok_form: {
          createMany: {
            data: dataDokumen as td_do_dok_form[],
          },
        },
        td_do_invoice_form: {
          createMany: {
            data: dataInvoice as td_do_invoice_form[],
          },
        },
        td_reqdo_status: {
          create: {
            name: 'Draft',
            datetime_status: new Date(),
          },
        },
      },
    });

    // TODO: POPULATE DATA SEAL TO CONTAINER ITEM
    const promises = data.cargoDetail.container.map((item) => {
      return this.prisma.td_do_kontainer_form.create({
        data: {
          id_reqdo_header: createdDo.id,
          created_by,
          gross_weight: item.grossWeight.amount,
          no_kontainer: item.containerNo,
          id_sizeType: item.sizeType.kodeSize,
          id_ownership: +item.ownership,
          id_gross_weight_unit: item.grossWeight.unit,
          seals: {
            create: item.sealNo.map((val) => ({
              assignedBy: created_by,
              seal: {
                create: {
                  no_seal: val,
                },
              },
            })),
          },
        },
      });
    });

    // Using Promise.all to wait for all promises to resolve
    Promise.all(promises)
      .then((results) => {
        console.log('All promises resolved successfully');
      })
      .catch((error) => {
        console.error('Error in one or more promises:', error);
      });

    return {
      messsage: 'success',
      data: createdDo,
    };
  }

  // UPDATE KONTAINER
  async updateKontainer(
    idDO: number,
    data: RequestDoDto,
    token: string,
    status?: StatusDo,
  ) {
    const userInfo = await this.userService.getDetail(token);
    const updated_by = userInfo.sub;

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not CO',
      );
    }

    // CHECK IF REQUEST TYPE = 1
    if (data.requestType !== 1) {
      throw new BadRequestException(
        'Tidak dapat melakukan create DO kontainer, requestType != 1',
      );
    }

    // CHECK IF USER IS FF AND SURAT KUASA EXIST
    if (
      data.requestDetail.requestor.requestorType == '2' &&
      !data.requestDetail.requestor.urlFile
    ) {
      throw new BadRequestException('Freight Forwarder required surat kuasa');
    }

    // CHECK IF DO already exist
    const doData = await this.getHeaderData(+idDO);
    if (!doData) {
      throw new NotFoundException(`DO with id = ${idDO} is not found!`);
    }

    // get last status DO
    const lastStatus = (await this.getAllStatus(+idDO)).data.pop().status;

    if (lastStatus !== 'Draft') {
      throw new BadRequestException(
        `Cannot update container DO, the last status DO is not draft!`,
      );
    }

    // CHECK IF STATUS REQDO Draft or Submitted
    if (!['Draft', 'Submitted'].includes(status)) {
      throw new BadRequestException(
        'Status DO of Update DO must be Draft or Submitted',
      );
    }

    // CASE 1 : IF THE STATUS IS SUBMITTED AFTER UPDATE DO, SEND PAYLOAD DATA TO SMART CONTRACT
    if (status === 'Submitted') {
      data.requestDetail.requestorId = userInfo.sub;
      data.requestDetail.requestDoNumber = generateNoReq(
        data.requestDetail.shippingLine.shippingType.split('|')[0].trim(),
      );
      const result = await this.smartContractService.requestDO(data, status);
      // get update header data
      const updatedHeader = await this.updateHeaderData(
        +idDO,
        data.requestDetail.requestDoNumber,
        result.response.orderId,
      );
      return result;
    }

    // CASE 2 : IF THE STATUS IS STILL DRAFT AFTER UPDATE DO, SAVE TO RELATIONAL DATABASE
    const dataInvoice = data.paymentDetail.invoice.map((item) => {
      const data: Partial<td_do_invoice_form> = {
        updated_by,
        created_by: updated_by,
        updated_at: new Date(),
        filepath_buktibayar: item.urlFile,
        id_bank: item.bankId,
        no_invoice: item.invoiceNo,
        tgl_invoice: new Date(item.invoiceDate),
        no_rekening: item.accountNo,
        total_payment: item.totalAmount,
        id_currency: item.currency, //TODO: ADD CURRENCY JSON
      };
      return data;
    });

    const dataDokumen = data.supportingDocument.documentType.map((item) => {
      const data: Partial<td_do_dok_form> = {
        updated_by,
        created_by: updated_by,
        updated_at: new Date(),
        id_jenis_dok: item.document,
        filepath_dok: item.urlFile,
        no_dok: item.documentNo,
        tgl_dok: new Date(item.documentDate),
      };
      return data;
    });

    const updateDo = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: +idDO,
      },
      data: {
        no_reqdo: generateNoReq(
          data.requestDetail.shippingLine.shippingType.split('|')[0].trim(),
        ),
        tgl_reqdo: new Date(),
        td_do_requestor_form: {
          update: {
            id_jenis_requestor: +data.requestDetail.requestor.requestorType,
            filepath_suratkuasa: data.requestDetail.requestor.urlFile,
          },
        },
        td_do_bl_form: {
          update: {
            updated_by,
            updated_at: new Date(),
            filepath_dok: data.requestDetail.document.urlFile,
            id_jenis_bl: data.requestDetail.document.ladingBillType,
            no_bl: data.requestDetail.document.ladingBillNumber,
            tgl_bl: new Date(data.requestDetail.document.ladingBillDate),
          },
        },
        td_do_req_form: {
          update: {
            updated_by,
            updated_at: new Date(),
            id_metode_bayar: +data.requestDetail.payment,
            id_shippingline: data.requestDetail.shippingLine.shippingType,
            nama_vessel: data.requestDetail.shippingLine.vesselName,
            no_voyage: data.requestDetail.shippingLine.voyageNumber,
            tgl_reqdo_exp: new Date(data.requestDetail.shippingLine.doExpired),
            no_bc11: data.requestDetail.document.bc11Number || null,
            tanggal_bc11: data.requestDetail.document.bc11Date
              ? new Date(data.requestDetail.document.bc11Date)
              : null,
            pos_number: data.requestDetail.document.posNumber,
          },
        },
        td_parties_detail_form: {
          update: {
            updated_by,
            updated_at: new Date(),
            id_negara_loading: data.location.locationType[0].countryCode,
            id_port_loading: data.location.locationType[0].portCode,
            id_port_discharge: data.location.locationType[1].portCode,
            id_port_destination: data.location.locationType[2].portCode,
            nama_consignee: data.parties.consignee.name,
            nama_notifyparty: data.parties.notifyParty.name,
            nama_shipper: data.parties.shipper.name,
            npwp_consignee: data.parties.consignee.npwp,
            npwp_notifyparty: data.parties.notifyParty.npwp,
          },
        },
        td_do_dok_form: {
          deleteMany: {},
          createMany: {
            data: dataDokumen as td_do_dok_form[],
          },
        },
        td_do_invoice_form: {
          deleteMany: {},
          createMany: {
            data: dataInvoice as td_do_invoice_form[],
          },
        },
        td_do_kontainer_form: {
          deleteMany: {},
        },
      },
    });

    const promises = data.cargoDetail.container.map((item) => {
      return this.prisma.td_do_kontainer_form.create({
        data: {
          id_reqdo_header: idDO,
          updated_by,
          created_by: updated_by,
          updated_at: new Date(),
          gross_weight: item.grossWeight.amount,
          no_kontainer: item.containerNo,
          id_sizeType: item.sizeType.kodeSize,
          id_ownership: +item.ownership,
          id_gross_weight_unit: item.grossWeight.unit,
          seals: {
            create: item.sealNo.map((val) => ({
              assignedBy: updated_by,
              seal: {
                create: {
                  no_seal: val,
                },
              },
            })),
          },
        },
      });
    });

    // Using Promise.all to wait for all promises to resolve
    Promise.all(promises)
      .then((results) => {
        console.log('All promises resolved successfully');
      })
      .catch((error) => {
        console.error('Error in one or more promises:', error);
      });

    // UPDATE STATUS DO
    const updatedStatus = await this.updateStatusDo(idDO, token, status);

    return {
      messsage: 'success',
      data: updatedStatus,
    };
  }

  // CREATE NON KONTAINER
  async createNonKontainer(
    data: RequestDoDto,
    token: string,
    status?: StatusDo,
  ) {
    const userInfo = await this.userService.getDetail(token);
    const created_by = userInfo.sub;

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot create DO non container, Role is not CO',
      );
    }

    // CHECK IF REQUEST TYPE = 2
    if (data.requestType !== 2) {
      throw new BadRequestException(
        'Tidak dapat melakukan create DO non kontainer, requestType != 2',
      );
    }

    // CHECK IF USER IS FF AND SURAT KUASA EXIST
    if (
      data.requestDetail.requestor.requestorType == '2' &&
      !data.requestDetail.requestor.urlFile
    ) {
      throw new BadRequestException('Freight Forwarder required surat kuasa');
    }

    // CHECK IF STATUS REQDO Draft or Submitted
    if (!['Draft', 'Submitted'].includes(status)) {
      throw new BadRequestException(
        'Status DO of Create DO must be Draft or Submitted',
      );
    }
    // CASE 1: IF SUBMITTED, SEND PAYLOAD TO SMART CONTRACT
    if (status === 'Submitted') {
      data.requestDetail.requestorId = userInfo.sub;
      data.requestDetail.requestDoNumber = generateNoReq(
        data.requestDetail.shippingLine.shippingType.split('|')[0].trim(),
      );
      const result = await this.smartContractService.requestDO(data, status);
      const headerDo = await this.prisma.td_reqdo_header_form.create({
        data: {
          order_id: result.response.orderId,
          request_type: data.requestType,
          no_reqdo: data.requestDetail.requestDoNumber,
          created_by: data.requestDetail.requestorId,
          td_reqdo_status: {
            create: {
              name: result.response.status,
              datetime_status: new Date(result.response.datetime),
            },
          },
        },
      });
      return {
        result,
        data: headerDo,
      };
    }

    // CASE 2: IF DRAFT, SAVE TO RELATIONAL DATABASE
    const dataDokumen = data.supportingDocument.documentType.map((item) => {
      const data: Partial<td_do_dok_form> = {
        created_by,
        id_jenis_dok: item.document,
        filepath_dok: item.urlFile,
        no_dok: item.documentNo,
        tgl_dok: new Date(item.documentDate),
      };

      return data;
    });

    const dataInvoice = data.paymentDetail.invoice.map((item) => {
      const data: Partial<td_do_invoice_form> = {
        created_by,
        filepath_buktibayar: item.urlFile,
        id_bank: item.bankId,
        no_invoice: item.invoiceNo,
        tgl_invoice: new Date(item.invoiceDate),
        no_rekening: item.accountNo,
        total_payment: item.totalAmount,
        id_currency: item.currency, //TODO: ADD CURRENCY JSON
      };

      return data;
    });

    const dataVin = data.vinDetail.vinNumber.map((vin) => {
      const data: Partial<td_do_vin> = {
        no_vin: vin,
      };
      return data;
    });

    const createdDo = await this.prisma.td_reqdo_header_form.create({
      data: {
        request_type: data.requestType,
        order_id: crypto.randomUUID(),
        no_reqdo: generateNoReq(
          data.requestDetail.shippingLine.shippingType.split('|')[0].trim(),
        ),
        created_by,
        td_do_requestor_form: {
          create: {
            id_jenis_requestor: +data.requestDetail.requestor.requestorType,
            alamat: data.requestDetail.requestor.requestorAddress,
            created_by,
            nama: data.requestDetail.requestor.requestorName,
            nib: data.requestDetail.requestor.nib,
            npwp: data.requestDetail.requestor.npwp,
            filepath_suratkuasa: data.requestDetail.requestor.urlFile,
          },
        },
        td_do_req_form: {
          create: {
            created_by,
            id_metode_bayar: +data.requestDetail.payment,
            id_shippingline: data.requestDetail.shippingLine.shippingType,
            nama_vessel: data.requestDetail.shippingLine.vesselName,
            no_voyage: data.requestDetail.shippingLine.voyageNumber,
            tgl_reqdo_exp: new Date(data.requestDetail.shippingLine.doExpired),
            no_bc11: data.requestDetail.document.bc11Number || null,
            tanggal_bc11: data.requestDetail.document.bc11Date
              ? new Date(data.requestDetail.document.bc11Date)
              : null,
            pos_number: data.requestDetail.document.posNumber,
          },
        },
        td_parties_detail_form: {
          create: {
            created_by,
            id_negara_loading: data.location.locationType[0].countryCode,
            id_port_loading: data.location.locationType[0].portCode,
            id_port_discharge: data.location.locationType[1].portCode,
            id_port_destination: data.location.locationType[2].portCode,
            nama_consignee: data.parties.consignee.name,
            nama_notifyparty: data.parties.notifyParty.name,
            nama_shipper: data.parties.shipper.name,
            npwp_consignee: data.parties.shipper.npwp,
            npwp_notifyparty: data.parties.notifyParty.npwp,
          },
        },
        td_do_bl_form: {
          create: {
            created_by,
            filepath_dok: data.requestDetail.document.urlFile,
            id_jenis_bl: data.requestDetail.document.ladingBillType,
            no_bl: data.requestDetail.document.ladingBillNumber,
            tgl_bl: new Date(data.requestDetail.document.ladingBillDate),
            do_vin: {
              createMany: {
                data: dataVin as td_do_vin[],
              },
            },
          },
        },
        td_do_dok_form: {
          createMany: {
            data: dataDokumen as td_do_dok_form[],
          },
        },
        td_do_invoice_form: {
          createMany: {
            data: dataInvoice as td_do_invoice_form[],
          },
        },
        td_reqdo_status: {
          create: {
            name: status ?? 'Draft',
          },
        },
      },
    });

    const promises = data.cargoDetail.nonContainer.map((item) => {
      return this.prisma.td_do_nonkontainer_form.create({
        data: {
          id_reqdo_header: createdDo.id,
          created_by,
          good_desc: item.goodsDescription,
          gross_weight: item.grossWeight.amount,
          id_gross_weight_unit: item.grossWeight.unit,
          measurement_unit: item.measurementVolume.unit,
          measurement_vol: item.measurementVolume.amount,
          package_qty: item.packageQuantity.amount,
          id_package_unit: item.packageQuantity.unit,
        },
      });
    });

    // Using Promise.all to wait for all promises to resolve
    Promise.all(promises)
      .then((results) => {
        console.log('All promises resolved successfully');
      })
      .catch((error) => {
        console.error('Error in one or more promises:', error);
      });

    return {
      messsage: 'success',
      data: createdDo,
    };
  }

  // UPDATE NON KONTAINER
  async updateNonKontainer(
    idDO: number,
    data: RequestDoDto,
    token: string,
    status?: StatusDo,
  ) {
    const userInfo = await this.userService.getDetail(token);
    const updated_by = userInfo.sub;

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO non container, Role is not CO',
      );
    }

    // CHECK IF REQUEST TYPE = 2
    if (data.requestType !== 2) {
      throw new BadRequestException(
        'Tidak dapat melakukan create DO non kontainer, requestType != 2',
      );
    }

    // CHECK IF USER IS FF AND SURAT KUASA EXIST
    if (
      data.requestDetail.requestor.requestorType == '2' &&
      !data.requestDetail.requestor.urlFile
    ) {
      throw new BadRequestException('Freight Forwarder required surat kuasa');
    }

    // find the last status DO
    const lastStatus = (await this.getAllStatus(idDO)).data.pop().status;
    if (lastStatus !== 'Draft') {
      throw new BadRequestException(
        `Cannot update non container DO, the last status DO is not draft!`,
      );
    }

    // CHECK IF STATUS REQDO Draft or Submitted
    if (!['Draft', 'Submitted'].includes(status)) {
      throw new BadRequestException(
        'Status DO of Update DO must be Draft or Submitted',
      );
    }

    // CHECK IF DO EXIST
    const headerData = await this.getHeaderData(idDO);
    if (!headerData) {
      throw new BadRequestException(`DO by id = ${idDO} not found.`);
    }

    // CASE 1 : IF STATUS DO IS SUBMITTED AFTER UPDATE DO, SEND PAYLOAD DATA TO SMART CONTRACT
    if (status === 'Submitted') {
      data.requestDetail.requestorId = userInfo.sub;
      data.requestDetail.requestDoNumber = generateNoReq(
        data.requestDetail.shippingLine.shippingType.split('|')[0].trim(),
      );
      const result = await this.smartContractService.requestDO(data, status);
      // update header data
      const updatedHeader = await this.updateHeaderData(
        +idDO,
        data.requestDetail.requestDoNumber,
        result.response.orderId,
      );
      return result;
    }

    // CASE 2 : IF STATUS DO IS STILL DRAFT AFTER UPDATE DO, UPDATE DO DATA ON DB
    const dataNonKontainer = data.cargoDetail.nonContainer.map((item) => {
      const data: Partial<td_do_nonkontainer_form> = {
        created_by: updated_by,
        updated_by,
        updated_at: new Date(),
        good_desc: item.goodsDescription,
        gross_weight: item.grossWeight.amount,
        id_gross_weight_unit: item.grossWeight.unit,
        measurement_unit: item.measurementVolume.unit,
        measurement_vol: item.measurementVolume.amount,
        package_qty: item.packageQuantity.amount,
        id_package_unit: item.packageQuantity.unit,
      };
      return data;
    });

    const dataDokumen = data.supportingDocument.documentType.map((item) => {
      const data: Partial<td_do_dok_form> = {
        created_by: updated_by,
        updated_by,
        updated_at: new Date(),
        id_jenis_dok: item.document,
        filepath_dok: item.urlFile,
        no_dok: item.documentNo,
        tgl_dok: new Date(item.documentDate),
      };
      return data;
    });

    const dataInvoice = data.paymentDetail.invoice.map((item) => {
      const data: Partial<td_do_invoice_form> = {
        created_by: updated_by,
        updated_by,
        updated_at: new Date(),
        no_invoice: item.invoiceNo,
        id_bank: item.bankId,
        filepath_buktibayar: item.urlFile,
        tgl_invoice: new Date(item.invoiceDate),
        no_rekening: item.accountNo,
        total_payment: item.totalAmount,
        id_currency: item.currency,
      };
      return data;
    });

    const dataVin = data.vinDetail.vinNumber.map((vin) => {
      const data: Partial<td_do_vin> = {
        no_vin: vin,
      };
      return data;
    });

    const updatedDo = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: idDO,
      },
      data: {
        no_reqdo: generateNoReq(
          data.requestDetail.shippingLine.shippingType.split('|')[0].trim(),
        ),
        tgl_reqdo: new Date(),
        td_do_requestor_form: {
          update: {
            id_jenis_requestor: +data.requestDetail.requestor.requestorType,
            filepath_suratkuasa: data.requestDetail.requestor.urlFile,
          },
        },
        td_do_bl_form: {
          update: {
            updated_by,
            updated_at: new Date(),
            filepath_dok: data.requestDetail.document.urlFile,
            no_bl: data.requestDetail.document.ladingBillNumber,
            tgl_bl: new Date(data.requestDetail.document.ladingBillDate),
            do_vin: {
              deleteMany: {},
              createMany: {
                data: dataVin as td_do_vin[],
              },
            },
          },
        },
        td_do_req_form: {
          update: {
            updated_by,
            updated_at: new Date(),
            id_metode_bayar: +data.requestDetail.payment,
            id_shippingline: data.requestDetail.shippingLine.shippingType,
            nama_vessel: data.requestDetail.shippingLine.vesselName,
            no_voyage: data.requestDetail.shippingLine.voyageNumber,
            tgl_reqdo_exp: new Date(data.requestDetail.shippingLine.doExpired),
            no_bc11: data.requestDetail.document.bc11Number || null,
            tanggal_bc11: data.requestDetail.document.bc11Date
              ? new Date(data.requestDetail.document.bc11Date)
              : null,
            pos_number: data.requestDetail.document.posNumber,
          },
        },
        td_parties_detail_form: {
          update: {
            updated_by,
            updated_at: new Date(),
            id_negara_loading: data.location.locationType[0].countryCode,
            id_port_loading: data.location.locationType[0].portCode,
            id_port_discharge: data.location.locationType[1].portCode,
            id_port_destination: data.location.locationType[2].portCode,
            nama_consignee: data.parties.consignee.name,
            nama_notifyparty: data.parties.notifyParty.name,
            nama_shipper: data.parties.shipper.name,
            npwp_consignee: data.parties.consignee.npwp,
            npwp_notifyparty: data.parties.notifyParty.npwp,
          },
        },
        td_do_dok_form: {
          deleteMany: {},
          createMany: {
            data: dataDokumen as td_do_dok_form[],
          },
        },
        td_do_invoice_form: {
          deleteMany: {},
          createMany: {
            data: dataInvoice as td_do_invoice_form[],
          },
        },
        td_do_nonkontainer_form: {
          deleteMany: {},
          createMany: {
            data: dataNonKontainer as td_do_nonkontainer_form[],
          },
        },
      },
    });

    // UPDATE STATUS REQDO FOR DRAFT
    const updatedStatus = await this.updateStatusDo(idDO, token, status);

    return {
      messsage: 'success',
      data: updatedStatus,
    };
  }

  async updateStatusDoProcessSL(idDO: number, token: string) {
    const userInfo = await this.userService.getDetail(token);
    // check if role is shippingline
    if (!userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update status DO on shippingline, role is not SL',
      );
    }
    // get header data
    const headerData = await this.getHeaderData(idDO);
    // check status if status DO == 'submitted'
    const statusDO = await this.smartContractService.getStatusDo(
      headerData.order_id,
    );
    if (statusDO.status !== 'Submitted') {
      throw new BadRequestException(
        `Cannot update status DO SL to Processed, last status DO is not Submitted`,
      );
    }
    // update status DO SL from 'Submitted' to 'Processed'
    const updatedDoSL = await this.smartContractService.updateStatusDo(
      userInfo.sub,
      headerData.order_id,
      'Processed',
    );

    const updatedStatusDO = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: +idDO,
      },
      data: {
        td_reqdo_status: {
          create: {
            name: updatedDoSL.status,
            datetime_status: new Date(updatedDoSL.datetime),
          },
        },
      },
    });

    return {
      status: 'success',
      data: updatedDoSL,
    };
    // update header DO
  }

  // UPDATE DO - SHIPPINGLINE
  async updateDoSL(
    idDO: number,
    data: UpdateDoSLDto,
    token: string,
    status: StatusDo,
  ) {
    const userInfo = await this.userService.getDetail(token);

    // CHECK IF ROLE IS SHIPPING LINE
    if (!userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot Update DO - Shippingline, Role is not SL',
      );
    }

    if (!['Rejected', 'Released'].includes(status)) {
      throw new BadRequestException(
        `Cannot create DO decision, status is not Released or Rejected`,
      );
    }

    const headerDo = await this.getHeaderData(+idDO);
    if (!headerDo) {
      throw new NotFoundException(`DO by id = ${idDO} not found.`);
    }

    // get last status do db
    const lastStatusDO = await this.smartContractService.getStatusDo(
      headerDo.order_id,
    );

    if (lastStatusDO.status !== 'Processed') {
      throw new BadRequestException(
        `Cannot update DO shippingline, the last status is not Processed!`,
      );
    }

    const response = await this.smartContractService.updateDoSL(
      userInfo.sub,
      headerDo.order_id,
      data,
      status,
    );

    // update status reqdo on db
    const updatedStatus = await this.updateStatusDo(
      idDO,
      token,
      status,
      data.statusNote,
    );

    return {
      message: 'success',
      data: updatedStatus,
    };
  }

  // GET ALL STATUS REQDO
  async getAllStatus(idDO: number) {
    // get timezone
    const timezone = getLocalTimeZone();
    const isDOExist = await this.getHeaderData(idDO);
    if (!isDOExist) {
      throw new NotFoundException(`DO Request by id = ${idDO} not found`);
    }
    const data = await this.prisma.td_reqdo_status.findMany({
      where: {
        id_reqdo_header: idDO,
      },
    });

    const result = data.map((item) => ({
      status: item.name,
      datetime: moment(item.datetime_status)
        .tz(timezone)
        .format('DD-MM-YYYY HH:mm:ss'),
    }));

    return {
      message: 'success',
      data: result,
    };
  }

  // UPDATE STATUS DO
  async updateStatusDo(
    idDO: number,
    token: string,
    status: StatusDo,
    note?: string,
  ) {
    const userInfo = await this.userService.getDetail(token);

    const statusDO = await this.prisma.td_reqdo_status.findFirst({
      where: {
        id_reqdo_header: idDO,
        name: status,
      },
    });

    if (!statusDO) {
      const updatedStatus = await this.prisma.td_reqdo_status.create({
        data: {
          name: status,
          id_reqdo_header: idDO,
          note: note,
        },
      });
      return updatedStatus;
    } else {
      const updatedStatus = await this.prisma.td_reqdo_status.update({
        where: {
          id: statusDO.id,
        },
        data: {
          datetime_status: new Date(),
        },
      });
      return updatedStatus;
    }
  }

  // GET DO DETAIL DRAFT
  async getDoDetailDraft(idDo: number) {
    const data = await this.prisma.td_reqdo_header_form.findUnique({
      include: {
        td_do_requestor_form: {
          select: {
            id_jenis_requestor: true,
            filepath_suratkuasa: true,
            nama: true,
            npwp: true,
            nib: true,
            alamat: true,
          },
        },
        td_do_bl_form: {
          select: {
            id_jenis_bl: true,
            tgl_bl: true,
            no_bl: true,
            filepath_dok: true,
            do_vin: true,
          },
        },
        td_do_req_form: {
          select: {
            tgl_reqdo_exp: true,
            id_metode_bayar: true,
            call_sign: true,
            no_do_release: true,
            tgl_do_release: true,
            tgl_do_exp: true,
            id_terminal_op: true,
            id_shippingline: true,
            nama_vessel: true,
            no_voyage: true,
            no_bc11: true,
            tanggal_bc11: true,
            pos_number: true,
          },
        },
        td_parties_detail_form: {
          select: {
            nama_shipper: true,
            nama_consignee: true,
            npwp_consignee: true,
            nama_notifyparty: true,
            npwp_notifyparty: true,
            id_negara_loading: true,
            id_port_discharge: true,
            id_port_destination: true,
            id_port_loading: true,
          },
        },
        td_do_kontainer_form: {
          include: {
            seals: {
              include: {
                seal: true,
              },
            },
            td_depo: true,
          },
        },
        td_do_nonkontainer_form: true,
        td_do_invoice_form: {
          select: {
            no_invoice: true,
            tgl_invoice: true,
            no_rekening: true,
            id_bank: true,
            id_currency: true,
            total_payment: true,
            filepath_buktibayar: true,
          },
        },
        td_do_dok_form: {
          select: {
            no_dok: true,
            tgl_dok: true,
            id_jenis_dok: true,
            filepath_dok: true,
          },
        },
      },
      where: {
        id: idDo,
      },
    });

    if (!data) {
      throw new NotFoundException(`${idDo} is not found`);
    }

    const response = {
      requestDetailForm: {
        requestorType: data.td_do_requestor_form.id_jenis_requestor,
        requestorName: data.td_do_requestor_form.nama,
        requestorNib: data.td_do_requestor_form.nib,
        requestorNpwp: data.td_do_requestor_form.npwp,
        requestorAlamat: data.td_do_requestor_form.alamat,
        requestorFile: data.td_do_requestor_form.filepath_suratkuasa,
        shippingLine: data.td_do_req_form.id_shippingline,
        vesselName: data.td_do_req_form.nama_vessel,
        voyageNumber: data.td_do_req_form.no_voyage,
        blNumber: data.td_do_bl_form.no_bl,
        blDate: data.td_do_bl_form.tgl_bl
          ? moment(data.td_do_bl_form.tgl_bl).format('YYYY-MM-DD')
          : null,
        blType: data.td_do_bl_form.id_jenis_bl,
        blFile: data.td_do_bl_form.filepath_dok,
        bc11Date: data.td_do_req_form.tanggal_bc11
          ? moment(data.td_do_req_form.tanggal_bc11).format('YYYY-MM-DD')
          : null,
        bc11Number: data.td_do_req_form.no_bc11 || '',
        kodePos: data.td_do_req_form.pos_number || '',
        reqdoExp: data.td_do_req_form.tgl_reqdo_exp
          ? moment(data.td_do_req_form.tgl_reqdo_exp).format('YYYY-MM-DD')
          : null,
        metodeBayar: data.td_do_req_form.id_metode_bayar,
        callSign: data.td_do_req_form.call_sign,
        doReleaseDate: data.td_do_req_form.tgl_do_release
          ? moment(data.td_do_req_form.tgl_do_release).format('YYYY-MM-DD')
          : null,
        doReleaseNumber: data.td_do_req_form.no_do_release,
        doExp: data.td_do_req_form.tgl_do_exp
          ? moment(data.td_do_req_form.tgl_do_exp).format('YYYY-MM-DD')
          : null,
        terminalOp: data.td_do_req_form.id_terminal_op,
      },
      partiesDetailForm: {
        shipperName: data.td_parties_detail_form.nama_shipper,
        consigneeName: data.td_parties_detail_form.nama_consignee,
        consigneeNpwp: data.td_parties_detail_form.npwp_consignee,
        notifyPartyName: data.td_parties_detail_form.nama_notifyparty,
        notifyPartyNpwp: data.td_parties_detail_form.npwp_notifyparty,
        placeLoading: data.td_parties_detail_form.id_negara_loading,
        portLoading: data.td_parties_detail_form.id_port_loading,
        placeDischarge: data.td_parties_detail_form.id_port_discharge,
        placeDestination: data.td_parties_detail_form.id_port_destination,
      },
      containerDetailForm: data.td_do_kontainer_form.map((data) => ({
        containerNumber: data.no_kontainer,
        containerSeal: data.seals.map((item) => item.seal.no_seal),
        sizeType: data.id_sizeType,
        grossWeightAmount: data.gross_weight,
        grossWeightUnit: data.id_gross_weight_unit,
        ownership: data.id_ownership,
        depoForm: {
          nama: data.td_depo?.deskripsi,
          npwp: data.td_depo?.npwp,
          alamat: data.td_depo?.alamat,
          noTelp: data.td_depo?.no_telp,
          kota: data.td_depo?.id_kabkota,
          kodePos: data.td_depo?.kode_pos,
        },
      })),
      nonContainerDetailForm: data.td_do_nonkontainer_form.map((data) => ({
        goodsDescription: data.good_desc,
        packageQuantityAmount: data.package_qty,
        packageQuantityUnit: data.id_package_unit,
        grossWeightAmount: data.gross_weight,
        grossWeightUnit: data.id_gross_weight_unit,
        measurementVolume: data.measurement_vol,
        measurementUnit: data.measurement_unit,
      })),
      vinDetailForm: data.td_do_bl_form.do_vin.map((vin) => vin),
      paymentDetailForm: data.td_do_invoice_form.map((inv) => ({
        invoiceNumber: inv.no_invoice,
        invoiceDate: inv.tgl_invoice
          ? moment(inv.tgl_invoice).format('YYYY-MM-DD')
          : null,
        currency: inv.id_currency,
        totalPayment: inv.total_payment,
        bank: inv.id_bank,
        accountNumber: inv.no_rekening,
        urlFile: inv.filepath_buktibayar,
      })),
      supportingDocumentForm: data.td_do_dok_form.map((dok) => ({
        documentType: dok.id_jenis_dok,
        documentNumber: dok.no_dok,
        documentDate: dok.tgl_dok
          ? moment(dok.tgl_dok).format('YYYY-MM-DD')
          : null,
        urlFile: dok.filepath_dok,
      })),
    };
    return response;
  }

  // GET DO DETAIL SMART CONTRACT
  async getDoDetailSC(username: string, orderId: string) {
    const data = await this.smartContractService.getDoDetailData(
      username,
      orderId,
    );
    const result = {
      requestDetailForm: {
        requestorType: data.requestDetail.requestor.requestorType,
        requestorName: data.requestDetail.requestor.requestorName,
        requestorNib: data.requestDetail.requestor.nib,
        requestorNpwp: data.requestDetail.requestor.npwp,
        requestorAlamat: data.requestDetail.requestor.requestorAddress,
        requestorFile: data.requestDetail.requestor.urlFile,
        shippingLine: data.requestDetail.shippingLine.shippingType,
        vesselName: data.requestDetail.shippingLine.vesselName,
        voyageNumber: data.requestDetail.shippingLine.voyageNumber,
        blNumber: data.requestDetail.document.ladingBillNumber,
        blDate: data.requestDetail.document.ladingBillDate
          ? moment(data.requestDetail.document.ladingBillDate).format(
              'YYYY-MM-DD',
            )
          : null,
        blType: data.requestDetail.document.ladingBillType,
        blFile: data.requestDetail.document.urlFile,
        bc11Date: data.requestDetail.document.bc11Date
          ? moment(data.requestDetail.document.bc11Date).format('YYYY-MM-DD')
          : null,
        bc11Number: data.requestDetail.document.bc11Number || '',
        kodePos: data.requestDetail.document.posNumber || '',
        reqdoExp: data.requestDetail.shippingLine.doExpired
          ? moment(data.requestDetail.shippingLine.doExpired).format(
              'YYYY-MM-DD',
            )
          : null,
        metodeBayar: data.requestDetail.payment,
        callSign: data.requestDetail.callSign || '',
        doReleaseDate: data.requestDetail.doReleaseDate
          ? moment(data.requestDetail.doReleaseDate).format('YYYY-MM-DD')
          : null,
        doReleaseNumber: data.requestDetail.doReleaseNo || '',
        doExp: data.requestDetail.doExpiredDate
          ? moment(data.requestDetail.doExpiredDate).format('YYYY-MM-DD')
          : null,
        terminalOp: data.requestDetail.terminalOp || '',
      },
      partiesDetailForm: {
        shipperName: data.parties.shipper.name,
        consigneeName: data.parties.consignee.name,
        consigneeNpwp: data.parties.consignee.npwp,
        notifyPartyName: data.parties.notifyParty.name,
        notifyPartyNpwp: data.parties.notifyParty.npwp,
        placeLoading: data.location.locationType[0].countryCode,
        portLoading: data.location.locationType[0].portCode,
        placeDischarge: data.location.locationType[1].portCode,
        placeDestination: data.location.locationType[2].portCode,
      },
      containerDetailForm:
        data.cargoDetail.container !== undefined
          ? data.cargoDetail.container.map((item) => ({
              containerNumber: item.containerNo,
              containerSeal: item.sealNo,
              sizeType: item.sizeType.kodeSize,
              grossWeightAmount: item.grossWeight.amount,
              grossWeightUnit: item.grossWeight.unit,
              ownership: item.ownership,
              depoForm: {
                nama:
                  item.depoDetail && item.depoDetail.depoName !== undefined
                    ? item.depoDetail.depoName
                    : '',
                npwp:
                  item.depoDetail && item.depoDetail.depoNpwp !== undefined
                    ? item.depoDetail.depoNpwp
                    : '',
                alamat:
                  item.depoDetail && item.depoDetail.alamat !== undefined
                    ? item.depoDetail.alamat
                    : '',
                noTelp:
                  item.depoDetail && item.depoDetail.noTelp !== undefined
                    ? item.depoDetail.noTelp
                    : '',
                kota:
                  item.depoDetail && item.depoDetail.kotaDepo !== undefined
                    ? item.depoDetail.kotaDepo
                    : '',
                kodePos:
                  item.depoDetail && item.depoDetail.kodePos !== undefined
                    ? item.depoDetail.kodePos
                    : '',
              },
            }))
          : [],
      nonContainerDetailForm:
        data.cargoDetail.nonContainer !== undefined
          ? data.cargoDetail.nonContainer.map((item) => ({
              goodsDescription: item.goodsDescription,
              packageQuantityAmount: item.packageQuantity.amount,
              packageQuantityUnit: item.packageQuantity.unit,
              grossWeightAmount: item.grossWeight.amount,
              grossWeightUnit: item.grossWeight.unit,
              measurementVolume: item.measurementVolume.amount,
              measurementUnit: item.measurementVolume.unit,
            }))
          : [],
      vinDetailForm:
        data.vinDetail.vinNumber.length !== 0 ? data.vinDetail.vinNumber : [],
      paymentDetailForm: data.paymentDetail.invoice.map((inv) => ({
        invoiceNumber: inv.invoiceNo,
        invoiceDate: inv.invoiceDate
          ? moment(inv.invoiceDate).format('YYYY-MM-DD')
          : null,
        currency: inv.currency,
        totalPayment: inv.totalAmount,
        bank: inv.bankId,
        accountNumber: inv.accountNo,
        urlFile: inv.urlFile,
      })),
      supportingDocumentForm: data.supportingDocument.documentType.map(
        (dok) => ({
          documentType: dok.document,
          documentNumber: dok.documentNo,
          documentDate: dok.documentDate
            ? moment(dok.documentDate).format('YYYY-MM-DD')
            : null,
          urlFile: dok.urlFile,
        }),
      ),
    };
    return result;
  }

  async getHeaderData(idDO: number) {
    const data = await this.prisma.td_reqdo_header_form.findUnique({
      where: {
        id: idDO,
      },
    });
    if (!data) {
      throw new NotFoundException(`${idDO} is not found`);
    }
    return data;
  }

  async updateHeaderData(idDO: number, reqdoNum: string, orderId: string) {
    // check if DO exist
    const headerData = await this.getHeaderData(idDO);
    // get status do from smart contract
    const statusDo = await this.smartContractService.getStatusDo(orderId);

    const updatedHeader = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: +idDO,
      },
      data: {
        no_reqdo: reqdoNum,
        order_id: orderId,
        tgl_reqdo: new Date(),
        td_reqdo_status: {
          create: {
            name: statusDo.status,
            datetime_status: new Date(statusDo.datetime),
          },
        },
      },
    });

    return updatedHeader;
  }
}
