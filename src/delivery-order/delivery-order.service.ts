import {
  BadRequestException,
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

  async getAllDo(token: string) {
    const userInfo = await this.userService.getDetail(token);
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

    if (!userInfo.profile.details.kd_detail_ga) {
      return data
        .filter((item) => item.created_by === userInfo.sub)
        .map((item) => ({
          id: item.id,
          requestNumber: item.no_reqdo,
          requestTime: moment(item.tgl_reqdo.toLocaleString()).format(
            'DD-MM-YYYY HH:mm:ss',
          ),
          blNumber: item.td_do_bl_form.no_bl,
          blDate: item.td_do_bl_form.tgl_bl
            ? moment(item.td_do_bl_form.tgl_bl.toLocaleString()).format(
                'DD-MM-YYYY',
              )
            : '',
          requestName: item.td_do_requestor_form.nama,
          shippingLine: item.td_do_req_form.id_shippingline,
          status: item.td_reqdo_status[0].name,
          isContainer: item.request_type == 1,
        }));
    } else {
      const sl_data = (await this.shippinglineService.findAll(token)).data
        .filter(
          (sl) => sl.kd_detail_ga === userInfo.profile.details.kd_detail_ga,
        )
        .map((sl) => sl.kode);
      return data
        .filter((item) =>
          sl_data.includes(
            item.td_do_req_form.id_shippingline.split('|')[0].trim(),
          ),
        )
        .map((item) => ({
          id: item.id,
          requestNumber: item.no_reqdo,
          requestTime: moment(item.tgl_reqdo).format('DD-MM-YYYY HH:mm:ss'),
          blNumber: item.td_do_bl_form.no_bl,
          blDate: moment(item.td_do_bl_form.tgl_bl).format('DD-MM-YYYY'),
          requestName: item.td_do_requestor_form.nama,
          shippingLine: item.td_do_req_form.id_shippingline,
          pod: item.td_parties_detail_form.id_port_discharge,
          status: item.td_reqdo_status[0].name,
          isContainer: item.request_type == 1,
        }));
    }
  }

  async getDoDetail(idDo: number) {
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
            kode_pos: true,
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
        td_do_vin: true,
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
          ? moment(data.td_do_bl_form.tgl_bl.toLocaleString()).format(
              'YYYY-MM-DD',
            )
          : null,
        blType: data.td_do_bl_form.id_jenis_bl,
        blFile: data.td_do_bl_form.filepath_dok,
        bc11Date: data.td_do_req_form.tanggal_bc11
          ? moment(data.td_do_req_form.tanggal_bc11.toLocaleString()).format(
              'YYYY-MM-DD',
            )
          : null,
        bc11Number: data.td_do_req_form.no_bc11 || '',
        kodePos: data.td_do_req_form.kode_pos || '',
        reqdoExp: data.td_do_req_form.tgl_reqdo_exp
          ? moment(data.td_do_req_form.tgl_reqdo_exp.toLocaleString()).format(
              'YYYY-MM-DD',
            )
          : null,
        metodeBayar: data.td_do_req_form.id_metode_bayar,
        callSign: data.td_do_req_form.call_sign,
        doReleaseDate: data.td_do_req_form.tgl_do_release
          ? moment(data.td_do_req_form.tgl_do_release.toLocaleString()).format(
              'YYYY-MM-DD',
            )
          : null,
        doReleaseNumber: data.td_do_req_form.no_do_release,
        doExp: data.td_do_req_form.tgl_do_exp
          ? moment(data.td_do_req_form.tgl_do_exp.toLocaleString()).format(
              'YYYY-MM-DD',
            )
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
      vinDetailForm: data.td_do_vin.map((vin) => ({
        ladingBillNumber: vin.no_bl,
        vinNumber: vin.no_vin,
      })),
      paymentDetailForm: data.td_do_invoice_form.map((inv) => ({
        invoiceNumber: inv.no_invoice,
        invoiceDate: inv.tgl_invoice
          ? moment(inv.tgl_invoice.toLocaleString()).format('YYYY-MM-DD')
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
          ? moment(dok.tgl_dok.toLocaleString()).format('YYYY-MM-DD')
          : null,
        urlFile: dok.filepath_dok,
      })),
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

    const isDoExist = await this.getDoDetail(idDO);
    if (!isDoExist) {
      throw new NotFoundException(`DO by id = ${idDO} not found.`);
    }

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
      data.requestorId = userInfo.sub;
      const result = await this.smartContractService.requestDO(data, status);
      return result;
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
        no_reqdo: generateNoReq(
          data.requestDetail.shippingLine.shippingType.split('|')[0].trim(),
        ),
        created_by,
        td_do_requestor_form: {
          create: {
            jenis_requestor: {
              connectOrCreate: {
                create: {
                  name:
                    +data.requestDetail.requestor.requestorType === 1
                      ? 'CO'
                      : 'FF',
                },
                where: {
                  id: +data.requestDetail.requestor.requestorType,
                },
              },
            },
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
    const doData = await this.getDoDetail(+idDO);
    if (!doData) {
      throw new NotFoundException(`DO with id = ${idDO} not found`);
    }

    const updateDo = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: idDO,
      },
      data: {
        td_do_requestor_form: {
          update: {
            jenis_requestor: {
              update: {
                name:
                  +data.requestDetail.requestor.requestorType === 1
                    ? 'CO'
                    : 'FF',
              },
            },
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
        no_reqdo: generateNoReq(
          data.requestDetail.shippingLine.shippingType.split('|')[0].trim(),
        ),
        created_by,
        td_do_requestor_form: {
          create: {
            jenis_requestor: {
              connectOrCreate: {
                create: {
                  name:
                    +data.requestDetail.requestor.requestorType === 1
                      ? 'CO'
                      : 'FF',
                },
                where: {
                  id: +data.requestDetail.requestor.requestorType,
                },
              },
            },
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
    const doData = await this.getDoDetail(idDO);
    if (!doData) {
      throw new BadRequestException(`DO by id = ${idDO} not found.`);
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
            jenis_requestor: {
              update: {
                name: +data.requestDetail.requestor.requestorType ? 'CO' : 'FF',
              },
            },
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
    const isDOExist = await this.getDoDetail(idDO);
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
}
