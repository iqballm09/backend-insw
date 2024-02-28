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
  td_do_nonkontainer_form,
  td_do_vin,
} from '@prisma/client';
import * as moment from 'moment';
import { UserService } from 'src/user/user.service';
import { generateNoReq, validateError } from 'src/util';
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

  async getAllDoCo(token: string) {
    let dataSubmitted = [];
    const userInfo = await this.userService.getDetail(token);

    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        `Cannot get all DO for CO, Role is not CO!`,
      );
    }

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
          item.created_by === userInfo.sub &&
          item.td_reqdo_status[0].name === 'Draft',
      )
      .map((item) => ({
        id: item.id,
        orderId: item.order_id,
        requestNumber: item.no_reqdo,
        requestTime: moment(item.tgl_reqdo).format('DD-MM-YYYY HH:mm:ss'),
        blNumber: item.td_do_bl_form.no_bl,
        blDate: item.td_do_bl_form.tgl_bl
          ? moment(item.td_do_bl_form.tgl_bl).format('DD-MM-YYYY')
          : null,
        requestName: item.td_do_requestor_form.nama,
        shippingLine: item.td_do_req_form.id_shippingline,
        status: item.td_reqdo_status[0].name,
        isContainer: item.request_type == 1,
      }));
    for (const item of (
      await this.smartContractService.getAllDoCo(userInfo.sub)
    ).data) {
      // get header data by order id
      const headerData = await this.prisma.td_reqdo_header_form.findFirst({
        where: {
          order_id: item.Record.orderId,
        },
      });
      dataSubmitted.push({
        id: headerData.id,
        orderId: item.Record.orderId,
        requestNumber: item.Record.requestDetail.requestDoNumber,
        requestTime: moment(headerData.tgl_reqdo).format('DD-MM-YYYY HH:mm:ss'),
        blNumber: item.Record.requestDetail.document.ladingBillNumber,
        blDate: item.Record.requestDetail.document.ladingBillDate
          ? moment(item.Record.requestDetail.document.ladingBillDate).format(
              'DD-MM-YYYY',
            )
          : null,
        requestName: item.Record.requestDetail.requestor.requestorName,
        shippingLine: item.Record.requestDetail.shippingLine.shippingType,
        status: item.Record.status,
        isContainer: item.Record.requestType == 1,
      });
    }
    // merge data draft and data submitted
    const dataDoCo = dataDraft.concat(dataSubmitted).sort((a, b) => {
      return a.requestTime.localeCompare(b.requestTime);
    });
    return dataDoCo;
  }

  async getDoDetail(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);
    // get header data by idDo
    const headerData = await this.getHeaderData(idDo);
    const data = await this.smartContractService.getDoDetailData(
      userInfo.sub,
      headerData.order_id,
    );
    const response = {
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
        kodePos: data.requestDetail.document.postalCode || '',
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
              sizeType: item.sizeType,
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
      vinDetailForm: data.vinDetail,
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

  // UPDATE DO - SHIPPINGLINE
  async updateDoSL(
    idDO: number,
    data: UpdateDoSLDto,
    token: string,
    status?: StatusDo,
  ) {
    const userInfo = await this.userService.getDetail(token);
    const updated_by = userInfo.sub;
    const updated_at = new Date();

    // CHECK IF ROLE IS SHIPPING LINE
    if (!userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot Update DO - Shippingline, Role is not SL',
      );
    }

    // const isDoExist = await this.getDoDetail(idDO);
    // if (!isDoExist) {
    //   throw new NotFoundException(`DO by id = ${idDO} not found.`);
    // }

    const updatedDo = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: idDO,
      },
      data: {
        td_do_req_form: {
          update: {
            nama_vessel: data.vesselName,
            no_voyage: data.voyageNo,
            call_sign: data.callSign,
            no_do_release: data.doReleaseNo,
            tgl_do_release: new Date(data.doReleaseDate),
            tgl_do_exp: new Date(data.doExpiredDate),
            id_terminal_op: data.terminalOp,
          },
        },
      },
    });

    let results = [];
    for (const item of data.cargoDetail) {
      const isCargoExist = await this.prisma.td_do_kontainer_form.findUnique({
        where: {
          id: +item.containerId,
        },
      });
      if (!!!isCargoExist) {
        throw new NotFoundException(
          `Kontainer DO by id = ${item.containerId} not found`,
        );
      }

      let depoData: DepoDto;
      if (!!!item.depoDetail.depoId) {
        depoData = await this.depoService.createDepo(
          item.depoDetail,
          updated_by,
        );
      } else {
        // check if depo exist
        const isDepoExist = await this.prisma.td_depo.findUnique({
          where: {
            id: +item.depoDetail.depoId,
          },
        });
        if (!isDepoExist) {
          throw new NotFoundException(
            `Depo by id = ${+item.depoDetail.depoId} not found`,
          );
        }

        depoData = await this.depoService.updateDepo(
          +item.depoDetail.depoId,
          item.depoDetail,
          updated_by,
        );
      }

      const result = await this.prisma.td_do_kontainer_form.update({
        where: {
          id: +item.containerId,
        },
        data: {
          updated_by,
          updated_at,
          no_kontainer: item.containerNo,
          id_sizeType: item.sizeType,
          td_depoId: depoData.depoId,
        },
      });
      results.push(result);
    }
    return {
      message: 'success',
      result: results,
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
      const headerDo = await this.prisma.td_reqdo_header_form.create({
        data: {
          order_id: result.response.orderId,
          request_type: data.requestType,
          no_reqdo: data.requestDetail.requestDoNumber,
          created_by: data.requestDetail.requestorId,
          td_reqdo_status: {
            create: {
              name: status,
              datetime_status: new Date(),
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
            kode_pos: data.requestDetail.document.postalCode,
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
            name: status ?? 'Draft',
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

    // find the last status DO
    const lastStatus = (await this.getAllStatus(idDO)).data.pop().status;
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

    // CHECK IF DO already exist
    //const doData = await this.getDoDetail(+idDO);
    // if (!doData) {
    //   throw new NotFoundException(`DO with id = ${idDO} not found`);
    // }

    const updateDo = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: idDO,
      },
      data: {
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
            kode_pos: data.requestDetail.document.postalCode,
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
      data: [updateDo, updatedStatus],
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
              name: status,
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

    const dataVin = data.vinDetail.map((item) => {
      const data = {
        no_bl: item.ladingBillNumber,
        no_vin: item.vinNumber,
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
            kode_pos: data.requestDetail.document.postalCode,
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
          },
        },
        td_do_dok_form: {
          createMany: {
            data: dataDokumen as td_do_dok_form[],
          },
        },
        td_do_vin: {
          createMany: {
            data: dataVin as td_do_vin[],
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

    // CHECK IF DO EXIST
    //const doData = await this.getDoDetail(idDO);
    // if (!doData) {
    //   throw new BadRequestException(`DO by id = ${idDO} not found.`);
    // }

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

    const dataVin = data.vinDetail.map((item) => {
      const data = {
        no_bl: item.ladingBillNumber,
        no_vin: item.vinNumber,
      };
      return data;
    });

    const updatedDo = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: idDO,
      },
      data: {
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
            kode_pos: data.requestDetail.document.postalCode,
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
        td_do_vin: {
          deleteMany: {},
          createMany: {
            data: dataVin as td_do_vin[],
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

    // UPDATE STATUS REQDO
    const updatedStatus = await this.updateStatusDo(idDO, token, status);

    return {
      messsage: 'success',
      data: [updatedDo, updatedStatus],
    };
  }

  // GET ALL STATUS REQDO
  async getAllStatus(idDO: number) {
    // const isDOExist = await this.getDoDetail(idDO);
    // if (!isDOExist) {
    //   throw new NotFoundException(`DO Request by id = ${idDO} not found`);
    // }
    const data = await this.prisma.td_reqdo_status.findMany({
      where: {
        id_reqdo_header: idDO,
      },
    });

    const result = data.map((item) => ({
      status: item.name,
      datetime: moment(item.datetime_status).format('DD-MM-YYYY HH:mm:ss'),
    }));

    return {
      message: 'success',
      data: result,
    };
  }

  // UPDATE STATUS DO
  async updateStatusDo(idDO: number, token: string, status: StatusDo) {
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
}
