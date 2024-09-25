import {
  BadRequestException,
  ConsoleLogger,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CargoVinDetail,
  Container,
  Invoice,
  NonContainer,
  PaymentSupportingDetail,
  RequestDetail,
  RequestDoDto,
  RequestPartiesDetail,
  UpdateDoSLDto,
  VinDetail,
} from './dto/create-do.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  StatusDo,
  td_do_dok_form,
  td_do_invoice_form,
  td_do_nonkontainer_form,
  td_do_vin,
} from '@prisma/client';
import * as moment from 'moment-timezone';
import { UserService } from 'src/user/user.service';
import { fonts, generateNoReq, jsonToBodyPdf } from 'src/util';
import { ShippinglineService } from 'src/referensi/shippingline/shippingline.service';
import { SmartContractService } from 'src/smart-contract/smart-contract.service';
import { v4 as uuidv4 } from 'uuid';
import * as pdfPrinter from 'pdfmake';
import * as fs from 'fs';
import { FlagService } from 'src/referensi/flag/flag.service';

const delay = (delayInms: any) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

@Injectable()
export class DeliveryOrderService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private shippinglineService: ShippinglineService,
    private smartContractService: SmartContractService,
    private flagService: FlagService,
  ) {}

  async getAllDoCo(coName: string) {
    let dataNonDraft = [];

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
            tgl_do_exp: true,
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
            datetime_status: true,
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
        requestTime: moment(item.tgl_reqdo, 'DD-MM-YYYY HH:mm:ss')
          .tz(item.timezone)
          .format('DD-MM-YYYY HH:mm:ss'),
        blNumber: item.td_do_bl_form.no_bl ? item.td_do_bl_form.no_bl : null,
        blDate: item.td_do_bl_form.tgl_bl
          ? moment(item.td_do_bl_form.tgl_bl, 'DD-MM-YYYY').format('DD-MM-YYYY')
          : null,
        requestName: item.td_do_requestor_form.nama,
        transactionId: item.order_id,
        doExp: item.td_do_req_form.tgl_do_exp
          ? moment(item.td_do_req_form.tgl_do_exp, 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            )
          : null,
        shippingLine: item.td_do_req_form.id_shippingline.split('|')[1].trim(),
        status: item.td_reqdo_status[0].name,
        statusDatetime: moment(
          item.td_reqdo_status[0].datetime_status,
          'DD-MM-YYYY HH:mm:ss',
        )
          .tz(item.timezone)
          .format('DD-MM-YYYY HH:mm:ss'),
        isContainer: item.request_type == 1,
      }));

    const listDraftId = dataDraft.map((item) => item.id);
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

      if (listDraftId && !listDraftId.includes(headerData.id)) {
        dataNonDraft.push({
          id: headerData.id,
          orderId: item.Record.orderId,
          requestNumber: item.Record.requestDetail.requestDoNumber,
          requestTime: moment(headerData.tgl_reqdo, 'DD-MM-YYYY HH:mm:ss')
            .tz(headerData.timezone)
            .format('DD-MM-YYYY HH:mm:ss'),
          blNumber: item.Record.requestDetail.document.ladingBillNumber,
          blDate: item.Record.requestDetail.document.ladingBillDate
            ? moment(
                new Date(
                  Date.parse(item.Record.requestDetail.document.ladingBillDate),
                ),
                'DD-MM-YYYY',
              ).format('DD-MM-YYYY')
            : null,
          transactionId: item.Record.orderId,
          doExp: item.Record.requestDetail.doExpiredDate
            ? moment(
                new Date(Date.parse(item.Record.requestDetail.doExpiredDate)),
                'YYYY-MM-DD',
              ).format('YYYY-MM-DD')
            : null,
          requestName: item.Record.requestDetail.requestor.requestorName,
          shippingLine: item.Record.requestDetail.shippingLine.shippingDetail,
          status: item.Record.status,
          statusDatetime: moment(item.Record.statusDate, 'DD-MM-YYYY HH:mm:ss')
            .tz(headerData.timezone)
            .format('DD-MM-YYYY HH:mm:ss'),
          isContainer: item.Record.requestType == 1,
        });
      }
    }

    // merge data draft and data submitted
    const dataDoCo = dataDraft.concat(dataNonDraft).sort((b, a) => {
      return a.statusDatetime.localeCompare(b.statusDatetime);
    });

    return dataDoCo;
  }

  async getAllDoSL(kodeDetailGa: string, token: string) {
    let dataDoSL = [];
    // get list of shippingline codes that by kode detail ga
    const listKodeSL = (await this.shippinglineService.findAll(token)).data
      .filter((item) => item.kd_detail_ga === kodeDetailGa)
      .map((item) => item.kode);

    for (const item of (await this.smartContractService.getAllDoSL(listKodeSL))
      .data) {
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
        requestTime: moment(headerData.tgl_reqdo, 'DD-MM-YYYY HH:mm:ss')
          .tz(headerData.timezone)
          .format('DD-MM-YYYY HH:mm:ss'),
        blNumber: item.Record.requestDetail.document.ladingBillNumber,
        blDate: item.Record.requestDetail.document.ladingBillDate
          ? moment(
              new Date(
                Date.parse(item.Record.requestDetail.document.ladingBillDate),
              ),
              'DD-MM-YYYY',
            ).format('DD-MM-YYYY')
          : null,
        transactionId: item.Record.orderId,
        doExp: item.Record.requestDetail.doExpiredDate
          ? moment(
              new Date(Date.parse(item.Record.requestDetail.doExpiredDate)),
              'YYYY-MM-DD',
            ).format('YYYY-MM-DD')
          : null,
        requestName: item.Record.requestDetail.requestor.requestorName,
        shippingLine: item.Record.requestDetail.shippingLine.shippingDetail,
        status: item.Record.status,
        statusDatetime: moment(item.Record.statusDate, 'DD-MM-YYYY HH:mm:ss')
          .tz(headerData.timezone)
          .format('DD-MM-YYYY HH:mm:ss'),
        isContainer: item.Record.requestType == 1,
      });
    }
    return dataDoSL.sort((b, a) => {
      return a.statusDatetime.localeCompare(b.statusDatetime);
    });
  }

  async getDoDetail(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);
    // get header data by idDo
    const headerData = await this.getHeaderData(idDo);
    // get last status DO
    if (!!idDo) {
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
      const response = await this.getDoDetailDraft(idDo, token);
      return response;
    }
    return {};
  }

  async deleteDo(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);
    // CHECK IF USER ROLE IS CO OR SL
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException('Failed to delete DO, Role is not CO');
    }

    const data = await this.getHeaderData(idDo);

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

  // UPDATE KONTAINER
  async updateKontainer(
    idDo: number,
    data: RequestDoDto,
    token: string,
    status?: StatusDo,
  ) {
    const listStatusDO = (await this.getAllStatus(+idDo)).data.map(
      (item) => item.status,
    );
    const userInfo = await this.userService.getDetail(token);
    const queryOwnership = await this.flagService.findAll(token, 'ownership');
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

    // get last status DO
    const lastStatus = listStatusDO[listStatusDO.length - 1];
    if (!['Draft', 'Rejected'].includes(lastStatus)) {
      throw new BadRequestException(
        `Cannot update container DO, the last status DO is not draft or rejected!`,
      );
    }

    // CHECK IF STATUS REQDO Draft or Submitted
    if (!['Draft', 'Submitted'].includes(status)) {
      throw new BadRequestException(
        'Status DO of Update DO must be Draft or Submitted',
      );
    }

    // CHECK IF USER IS FF AND SURAT KUASA EXIST
    if (
      data.requestDetail.requestor.requestorType == '2' &&
      !data.requestDetail.requestor.urlFile
    ) {
      throw new BadRequestException('Freight Forwarder required surat kuasa');
    }

    const doData = await this.getHeaderData(idDo);

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
        id: +idDo,
      },
      data: {
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
            id_port_loading: data.location.locationType[0].portDetail,
            id_port_discharge: data.location.locationType[1].portDetail,
            id_port_destination: data.location.locationType[2].portDetail,
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
      },
    });

    const promises = data.cargoDetail.container.map(async (item) => {
      if (!!+item.Id) {
        const con = await this.prisma.td_do_kontainer_form.findUnique({
          where: {
            id: +item.Id,
          },
        });
        if (con) {
          return this.prisma.td_do_kontainer_form.update({
            where: {
              id: +item.Id,
            },
            data: {
              id_reqdo_header: idDo,
              updated_by,
              updated_at: new Date(),
              gross_weight: item.grossWeight.amount,
              no_kontainer: item.containerNo,
              id_sizeType: item.sizeType.kodeSize,
              id_ownership: +queryOwnership.data.filter(
                (own) =>
                  own.uraian ===
                  (Array.isArray(item.ownership)
                    ? item.ownership[0]
                    : item.ownership),
              )[0].kode,
              id_gross_weight_unit: item.grossWeight.unit,
              seals: {
                deleteMany: {},
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
        }
      } else {
        return this.prisma.td_do_kontainer_form.create({
          data: {
            id_reqdo_header: idDo,
            created_at: new Date(),
            created_by: updated_by,
            gross_weight: item.grossWeight.amount,
            no_kontainer: item.containerNo,
            id_sizeType: item.sizeType.kodeSize,
            id_ownership: +queryOwnership.data.filter(
              (own) =>
                own.uraian ===
                (Array.isArray(item.ownership)
                  ? item.ownership[0]
                  : item.ownership),
            )[0].kode,
            id_gross_weight_unit: item.grossWeight.unit,
            td_depo: {
              create: {
                created_by: userInfo.sub,
                alamat: '',
                deskripsi: '',
                id_kabkota: '',
                kode_pos: '',
                no_telp: '',
                npwp: '',
              },
            },
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
      }
    });

    // Using Promise.all to wait for all promises to resolve
    Promise.all(promises)
      .then(async (results) => {
        console.log('All promises resolved successfully');
        const doDraft = await this.getDataDraft(idDo);
        data.requestDetail.requestor.urlFile =
          doDraft.td_do_requestor_form.filepath_suratkuasa;
        data.requestDetail.requestor.requestorName =
          doDraft.td_do_requestor_form.nama;
        data.requestDetail.requestor.requestorId = userInfo.sub;
        data.requestDetail.requestDoNumber = doDraft.no_reqdo;
        data.requestDetail.shippingLine.shippingDetail =
          doDraft.td_do_req_form.id_shippingline.split('|')[1].trim();
        data.requestDetail.shippingLine.shippingType =
          doDraft.td_do_req_form.id_shippingline.split('|')[0].trim();
        data.requestDetail.document.bc11Date = doDraft.td_do_req_form
          .tanggal_bc11
          ? String(doDraft.td_do_req_form.tanggal_bc11)
          : '';
        data.requestDetail.document.bc11Number = doDraft.td_do_req_form.no_bc11
          ? doDraft.td_do_req_form.no_bc11
          : '';
        data.requestDetail.shippingLine.vesselName =
          doDraft.td_do_req_form.nama_vessel || '';
        data.requestDetail.shippingLine.voyageNumber =
          doDraft.td_do_req_form.no_voyage || '';

        // CASE 1 : IF THE STATUS IS SUBMITTED AND THE LAST STATUS OR BEFORE IS REJECTED, THEN HIT UPDATE DO SMART CONTRACT
        if (listStatusDO.includes('Rejected') && status === 'Submitted') {
          const listConData = [];
          doDraft.td_do_kontainer_form.forEach((con) => {
            const result = {
              Id: String(con.id),
              containerNo: con.no_kontainer,
              grossWeight: {
                amount: con.gross_weight,
                unit: con.id_gross_weight_unit,
              },
              sealNo: con.seals.map((seal) => seal.seal.no_seal),
              ownership: queryOwnership.data.filter(
                (own) => +own.kode === con.id_ownership,
              )[0].uraian,
              sizeType: {
                kodeSize: con.id_sizeType,
              },
              depoDetail: {
                Id: con.td_depo.id ? String(con.td_depo.id) : '',
                depoName: con.td_depo.deskripsi ? con.td_depo.deskripsi : '',
                depoNpwp: con.td_depo.npwp ? con.td_depo.npwp : '',
                noTelp: con.td_depo.no_telp ? con.td_depo.no_telp : '',
                alamat: con.td_depo.alamat ? con.td_depo.alamat : '',
                kotaDepo: con.td_depo.id_kabkota ? con.td_depo.id_kabkota : '',
                kodePos: con.td_depo.kode_pos ? con.td_depo.kode_pos : '',
              },
            };
            listConData.push(result);
          });
          data.cargoDetail.container = listConData;
          data.requestDetail.terminalOp = doDraft.td_do_req_form.id_terminal_op;
          data.requestDetail.document.posNumber = doDraft.td_do_req_form
            .pos_number
            ? doDraft.td_do_req_form.pos_number
            : '';
          data.requestDetail.callSign = doDraft.td_do_req_form.call_sign;
          data.requestDetail.doReleaseNo = doDraft.td_do_req_form.no_do_release;
          data.requestDetail.doReleaseDate = String(
            doDraft.td_do_req_form.tgl_do_release,
          );
          data.requestDetail.doExpiredDate = String(
            doDraft.td_do_req_form.tgl_do_exp,
          );

          const result = await this.smartContractService.updateDoCo(
            doData.order_id,
            data,
            status,
            doDraft.td_reqdo_status[0].note,
          );

          // generate status do to smart contract
          const headerDo = await this.prisma.td_reqdo_header_form.update({
            where: {
              id: doData.id,
            },
            data: {
              order_id: doDraft.order_id,
              request_type: data.requestType,
              no_reqdo: data.requestDetail.requestDoNumber,
              created_by: data.requestDetail.requestor.requestorId,
              tgl_reqdo: new Date(result.datetime),
              td_reqdo_status: {
                create: {
                  name: result.status,
                  datetime_status: new Date(result.datetime),
                },
              },
            },
          });
        }

        // CASE 2 : IF THE STATUS IS SUBMITTED, SEND PAYLOAD DATA TO SMART CONTRACT
        else if (status === 'Submitted') {
          const listConData: Container[] = [];
          doDraft.td_do_kontainer_form.forEach((con) => {
            const result = {
              Id: String(con.id),
              containerNo: con.no_kontainer,
              grossWeight: {
                amount: con.gross_weight,
                unit: con.id_gross_weight_unit,
              },
              sealNo: con.seals.map((seal) => seal.seal.no_seal),
              ownership: queryOwnership.data.filter(
                (own) => +own.kode === con.id_ownership,
              )[0].uraian,
              sizeType: {
                kodeSize: con.id_sizeType,
              },
              depoDetail: {
                Id: con.td_depo.id ? String(con.td_depo.id) : '',
                depoName: con.td_depo.deskripsi ? con.td_depo.deskripsi : '',
                depoNpwp: con.td_depo.npwp ? con.td_depo.npwp : '',
                noTelp: con.td_depo.no_telp ? con.td_depo.no_telp : '',
                alamat: con.td_depo.alamat ? con.td_depo.alamat : '',
                kotaDepo: con.td_depo.id_kabkota ? con.td_depo.id_kabkota : '',
                kodePos: con.td_depo.kode_pos ? con.td_depo.kode_pos : '',
              },
            };
            listConData.push(result);
          });

          data.cargoDetail.container = listConData;

          const result = await this.smartContractService.requestDO(data);
          // generate status do to smart contract
          const headerDo = await this.prisma.td_reqdo_header_form.update({
            where: {
              id: doData.id,
            },
            data: {
              order_id: result.orderId,
              request_type: data.requestType,
              no_reqdo: data.requestDetail.requestDoNumber,
              created_by: data.requestDetail.requestor.requestorId,
              tgl_reqdo: new Date(result.datetime),
            },
          });
        }
      })
      .catch((error) => {
        console.error('Error in one or more promises:', error);
      });

    // UPDATE STATUS DO
    const updatedStatus = await this.updateStatusDo(idDo, token, status);

    return {
      messsage: 'success',
      data: updatedStatus,
    };
  }

  // UPDATE NON KONTAINER
  async updateNonKontainer(
    idDo: number,
    data: RequestDoDto,
    token: string,
    status?: StatusDo,
  ) {
    const listStatusDO = (await this.getAllStatus(+idDo)).data.map(
      (item) => item.status,
    );
    const userInfo = await this.userService.getDetail(token);
    const updated_by = userInfo.sub;
    const created_by = userInfo.sub;

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
    const lastStatus = listStatusDO[listStatusDO.length - 1];
    if (!['Draft', 'Rejected'].includes(lastStatus)) {
      throw new BadRequestException(
        `Cannot update non container DO, the last status DO is not draft or rejected!`,
      );
    }

    // CHECK IF STATUS REQDO Draft or Submitted
    if (!['Draft', 'Submitted'].includes(status)) {
      throw new BadRequestException(
        'Status DO of Update DO must be Draft or Submitted',
      );
    }

    // CHECK IF DO already exist
    const doData = await this.getHeaderData(idDo);

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

    const dataNonKontainer = data.cargoDetail.nonContainer.map((item) => {
      const data: Partial<td_do_nonkontainer_form> = {
        created_by,
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

    const dataVin = data.vinDetail.vinData.map((vin) => {
      const data: Partial<td_do_vin> = {
        no_vin: vin.vinNumber,
      };
      return data;
    });

    const updatedDo = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: idDo,
      },
      data: {
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
            id_port_loading: data.location.locationType[0].portDetail,
            id_port_discharge: data.location.locationType[1].portDetail,
            id_port_destination: data.location.locationType[2].portDetail,
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

    const doDraft = await this.getDataDraft(idDo);

    data.cargoDetail.nonContainer = doDraft.td_do_nonkontainer_form.map(
      (item) => ({
        Id: String(item.id),
        goodsDescription: item.good_desc,
        packageQuantity: {
          amount: item.package_qty,
          unit: item.id_package_unit,
        },
        grossWeight: {
          amount: item.gross_weight,
          unit: item.id_gross_weight_unit,
        },
        measurementVolume: {
          amount: item.measurement_vol,
          unit: item.measurement_unit,
        },
      }),
    );

    data.vinDetail = {
      ladingBillNumber: doDraft.td_do_bl_form.no_bl,
      vinData: doDraft.td_do_bl_form.do_vin.map((item) => ({
        Id: String(item.id),
        vinNumber: item.no_vin,
      })),
    };

    data.requestDetail.requestor.urlFile =
      doDraft.td_do_requestor_form.filepath_suratkuasa;
    data.requestDetail.requestor.requestorName =
      doDraft.td_do_requestor_form.nama;
    data.requestDetail.requestor.requestorId = userInfo.sub;
    data.requestDetail.requestDoNumber = doDraft.no_reqdo;
    data.requestDetail.shippingLine.shippingDetail =
      doDraft.td_do_req_form.id_shippingline.split('|')[1].trim();
    data.requestDetail.shippingLine.shippingType =
      doDraft.td_do_req_form.id_shippingline.split('|')[0].trim();
    data.requestDetail.document.bc11Date = doDraft.td_do_req_form.tanggal_bc11
      ? String(doDraft.td_do_req_form.tanggal_bc11)
      : '';
    data.requestDetail.document.bc11Number = doDraft.td_do_req_form.no_bc11
      ? doDraft.td_do_req_form.no_bc11
      : '';
    data.requestDetail.shippingLine.vesselName =
      doDraft.td_do_req_form.nama_vessel || '';
    data.requestDetail.shippingLine.voyageNumber =
      doDraft.td_do_req_form.no_voyage || '';

    // CASE 1 : IF THE STATUS IS SUBMITTED AND THE LAST STATUS OR BEFORE IS REJECTED, THEN HIT UPDATE DO SMART CONTRACT
    if (listStatusDO.includes('Rejected') && status === 'Submitted') {
      data.requestDetail.terminalOp = doDraft.td_do_req_form.id_terminal_op;
      data.requestDetail.document.posNumber = doDraft.td_do_req_form.pos_number
        ? doDraft.td_do_req_form.pos_number
        : '';
      data.requestDetail.callSign = doDraft.td_do_req_form.call_sign;
      data.requestDetail.doReleaseNo = doDraft.td_do_req_form.no_do_release;
      data.requestDetail.doReleaseDate = String(
        doDraft.td_do_req_form.tgl_do_release,
      );
      data.requestDetail.doExpiredDate = String(
        doDraft.td_do_req_form.tgl_do_exp,
      );

      const result = await this.smartContractService.updateDoCo(
        doDraft.order_id,
        data,
        status,
        doDraft.td_reqdo_status[0].note,
      );

      // generate status do to smart contract
      const headerDo = await this.prisma.td_reqdo_header_form.update({
        where: {
          id: doDraft.id,
        },
        data: {
          order_id: doDraft.order_id,
          request_type: data.requestType,
          no_reqdo: data.requestDetail.requestDoNumber,
          created_by: data.requestDetail.requestor.requestorId,
          tgl_reqdo: new Date(result.datetime),
          td_reqdo_status: {
            create: {
              name: result.status,
              datetime_status: new Date(result.datetime),
            },
          },
        },
      });
    }

    // CASE 2 : IF STATUS DO IS SUBMITTED AFTER UPDATE DO, SEND PAYLOAD DATA TO SMART CONTRACT
    else if (status === 'Submitted') {
      data.requestDetail.document.bc11Date = data.requestDetail.document
        .bc11Date
        ? data.requestDetail.document.bc11Date
        : '';
      data.requestDetail.document.bc11Number = data.requestDetail.document
        .bc11Number
        ? data.requestDetail.document.bc11Number
        : '';
      data.requestDetail.document.posNumber = data.requestDetail.document
        .posNumber
        ? data.requestDetail.document.posNumber
        : '';

      const result = await this.smartContractService.requestDO(data);

      // generate status do to smart contract
      const headerDo = await this.prisma.td_reqdo_header_form.update({
        where: {
          id: doDraft.id,
        },
        data: {
          order_id: result.orderId,
          request_type: data.requestType,
          no_reqdo: data.requestDetail.requestDoNumber,
          created_by: data.requestDetail.requestor.requestorId,
          tgl_reqdo: new Date(result.datetime),
        },
      });
    }

    // UPDATE STATUS REQDO FOR DRAFT
    const updatedStatus = await this.updateStatusDo(idDo, token, status);

    return {
      messsage: 'success',
      data: updatedStatus,
    };
  }

  async updateStatusDoProcessSL(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);
    // check if role is shippingline
    if (!userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update status DO on shippingline, role is not SL',
      );
    }
    // get header data
    const headerData = await this.getHeaderData(idDo);
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
    const updatedDoSL = await this.smartContractService.updateStatusDoSl(
      headerData.order_id,
      'Processed',
      '',
    );

    const updatedStatusDO = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: +idDo,
      },
      data: {
        td_reqdo_status: {
          create: {
            name: updatedDoSL.status,
            datetime_status: new Date(Date.parse(updatedDoSL.datetime)),
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
    idDo: number,
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

    const headerDo = await this.getHeaderData(+idDo);

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
      headerDo.order_id,
      data,
      status,
    );

    // update data on DB
    const updatedData = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: headerDo.id,
      },
      data: {
        td_do_req_form: {
          update: {
            nama_vessel: data.vesselName,
            no_voyage: data.voyageNo,
            call_sign: data.callSign,
            no_do_release: data.doReleaseNo,
            tgl_do_release: data.doReleaseDate
              ? new Date(data.doReleaseDate)
              : null,
            tgl_do_exp: data.doExpiredDate
              ? new Date(data.doExpiredDate)
              : null,
            id_terminal_op: data.terminalOp,
          },
        },
      },
    });

    if (headerDo.request_type === 1) {
      const conData = await this.prisma.td_do_kontainer_form.findMany({
        where: {
          id_reqdo_header: headerDo.id,
        },
      });
      if (!conData) {
        throw new NotFoundException(
          `Containers Data by id = ${headerDo.id} not found`,
        );
      }

      for (let i = 0; i < conData.length; i++) {
        (data.cargoDetail[i].depoDetail.depoNpwp =
          data.cargoDetail[i].depoDetail.depoNpwp || ''),
          (data.cargoDetail[i].depoDetail.alamat =
            data.cargoDetail[i].depoDetail.alamat || ''),
          (data.cargoDetail[i].depoDetail.kodePos =
            data.cargoDetail[i].depoDetail.kodePos || ''),
          (data.cargoDetail[i].depoDetail.kotaDepo =
            data.cargoDetail[i].depoDetail.kotaDepo || '');

        const updatedCon = await this.prisma.td_do_kontainer_form.update({
          where: {
            id: conData[i].id,
          },
          data: {
            no_kontainer: data.cargoDetail[i].containerNo,
            id_sizeType: data.cargoDetail[i].sizeType.kodeSize,
            td_depo: {
              update: {
                deskripsi: data.cargoDetail[i].depoDetail.depoName,
                npwp: data.cargoDetail[i].depoDetail.depoNpwp,
                no_telp: data.cargoDetail[i].depoDetail.noTelp,
                alamat: data.cargoDetail[i].depoDetail.alamat,
                kode_pos: data.cargoDetail[i].depoDetail.kodePos,
                id_kabkota: data.cargoDetail[i].depoDetail.kotaDepo,
                created_by: userInfo.sub,
              },
            },
          },
        });
      }
    }

    // update status reqdo on db
    const updatedStatus = await this.updateStatusDo(
      idDo,
      token,
      status,
      data.statusNote,
    );

    return {
      message: 'success',
      data: {
        id: updatedStatus.id,
        id_reqdo_header: updatedStatus.id_reqdo_header,
        name: updatedStatus.name,
        datetime_status: updatedStatus.datetime_status,
        note: updatedStatus.note,
        isContainer: headerDo.request_type === 1,
      },
    };
  }

  // GET ALL STATUS REQDO
  async getAllStatus(idDo: number) {
    if (!!idDo) {
      const headerDo = await this.getHeaderData(idDo);
      const data = await this.prisma.td_reqdo_status.findMany({
        where: {
          id_reqdo_header: idDo,
        },
      });

      const result = data
        .map((item) => ({
          status: item.name,
          datetime: moment(item.datetime_status, 'DD-MM-YYYY HH:mm:ss')
            .tz(headerDo.timezone)
            .format('DD-MM-YYYY HH:mm:ss'),
          note: item.note,
        }))
        .sort((a, b) =>
          moment(a.datetime, 'DD-MM-YYYY HH:mm:ss').diff(
            moment(b.datetime, 'DD-MM-YYYY HH:mm:ss'),
          ),
        );

      return {
        message: 'success',
        data: result,
      };
    }
  }

  // UPDATE STATUS DO
  async updateStatusDo(
    idDo: number,
    token: string,
    status: StatusDo,
    note?: string,
  ) {
    const userInfo = await this.userService.getDetail(token);

    const headerData = await this.prisma.td_reqdo_header_form.findUnique({
      select: {
        td_reqdo_status: {
          orderBy: {
            datetime_status: 'desc',
          },
          take: 1,
        },
      },
      where: {
        id: idDo,
      },
    });

    const lastStatus = headerData.td_reqdo_status[0];

    if (lastStatus.name === status) {
      const updatedStatus = await this.prisma.td_reqdo_status.update({
        data: {
          name: status,
          datetime_status: new Date(),
        },
        where: {
          id: lastStatus.id,
        },
      });
      return updatedStatus;
    } else {
      const updatedStatus = await this.prisma.td_reqdo_status.create({
        data: {
          name: status,
          datetime_status: new Date(),
          id_reqdo_header: idDo,
          note: note,
        },
      });
      return updatedStatus;
    }
  }

  // GET DO DETAIL DRAFT
  async getDoDetailDraft(idDo: number, token: string) {
    const data = await this.getDataDraft(idDo);
    const queryOwnership = await this.flagService.findAll(token, 'ownership');

    // get statusDO
    const statusDO = data.td_reqdo_status.pop();

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
        vesselName: data.td_do_req_form.nama_vessel || '',
        voyageNumber: data.td_do_req_form.no_voyage || '',
        blNumber: data.td_do_bl_form.no_bl || '',
        blDate: data.td_do_bl_form.tgl_bl
          ? moment(data.td_do_bl_form.tgl_bl, 'YYYY-MM-DD').format('YYYY-MM-DD')
          : null,
        blType: data.td_do_bl_form.id_jenis_bl || '',
        blFile: data.td_do_bl_form.filepath_dok || '',
        bc11Date: data.td_do_req_form.tanggal_bc11
          ? moment(data.td_do_req_form.tanggal_bc11, 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            )
          : null,
        bc11Number: data.td_do_req_form.no_bc11 || '',
        posNumber: data.td_do_req_form.pos_number || '',
        reqdoExp: data.td_do_req_form.tgl_reqdo_exp
          ? moment(data.td_do_req_form.tgl_reqdo_exp, 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            )
          : null,
        metodeBayar: data.td_do_req_form.id_metode_bayar || '',
        callSign: data.td_do_req_form.call_sign || '',
        doReleaseDate: data.td_do_req_form.tgl_do_release
          ? moment(data.td_do_req_form.tgl_do_release, 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            )
          : null,
        doReleaseNumber: data.td_do_req_form.no_do_release || '',
        doExp: data.td_do_req_form.tgl_do_exp
          ? moment(data.td_do_req_form.tgl_do_exp, 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            )
          : null,
        terminalOp: data.td_do_req_form.id_terminal_op || '',
      },
      partiesDetailForm: {
        shipperName: data.td_parties_detail_form.nama_shipper || '',
        consigneeName: data.td_parties_detail_form.nama_consignee || '',
        consigneeNpwp: data.td_parties_detail_form.npwp_consignee || '',
        notifyPartyName: data.td_parties_detail_form.nama_notifyparty || '',
        notifyPartyNpwp: data.td_parties_detail_form.npwp_notifyparty || '',
        placeLoading: data.td_parties_detail_form.id_negara_loading || '',
        portLoading: data.td_parties_detail_form.id_port_loading || '',
        placeDischarge: data.td_parties_detail_form.id_port_discharge || '',
        placeDestination: data.td_parties_detail_form.id_port_destination || '',
      },
      containerDetailForm: !!data.td_do_kontainer_form.length
        ? data.td_do_kontainer_form.map((data) => ({
            Id: data.id,
            containerNumber: data.no_kontainer,
            containerSeal: data.seals.map((item) => item.seal.no_seal),
            sizeType: data.id_sizeType,
            grossWeightAmount: data.gross_weight,
            grossWeightUnit: data.id_gross_weight_unit,
            ownership: queryOwnership.data.filter(
              (own) => +own.kode === data.id_ownership,
            )[0].uraian,
            depoForm: {
              Id: data.td_depo?.id,
              nama: data.td_depo?.deskripsi,
              npwp: data.td_depo?.npwp,
              alamat: data.td_depo?.alamat,
              noTelp: data.td_depo?.no_telp,
              kota: data.td_depo?.id_kabkota,
              kodePos: data.td_depo?.kode_pos,
            },
          }))
        : [],
      nonContainerDetailForm: data.td_do_nonkontainer_form.length
        ? data.td_do_nonkontainer_form.map((data) => ({
            Id: data.id,
            goodsDescription: data.good_desc,
            packageQuantityAmount: data.package_qty,
            packageQuantityUnit: data.id_package_unit,
            grossWeightAmount: data.gross_weight,
            grossWeightUnit: data.id_gross_weight_unit,
            measurementVolume: data.measurement_vol,
            measurementUnit: data.measurement_unit,
          }))
        : [],
      vinDetailForm: {
        ladingBillNumber: data.td_do_bl_form.no_bl,
        vinData: data.td_do_bl_form.do_vin.length
          ? data.td_do_bl_form.do_vin.map((vin) => ({
              Id: vin.id,
              vinNumber: vin.no_vin,
            }))
          : [],
      },
      paymentDetailForm: data.td_do_invoice_form.length
        ? data.td_do_invoice_form.map((inv) => ({
            invoiceNumber: inv.no_invoice,
            invoiceDate: inv.tgl_invoice
              ? moment(inv.tgl_invoice).format('YYYY-MM-DD')
              : null,
            currency: inv.id_currency,
            totalPayment: inv.total_payment,
            bank: inv.id_bank,
            accountNumber: inv.no_rekening,
            urlFile: inv.filepath_buktibayar,
          }))
        : [],
      supportingDocumentForm: data.td_do_dok_form.length
        ? data.td_do_dok_form.map((dok) => ({
            documentType: dok.id_jenis_dok,
            documentNumber: dok.no_dok,
            documentDate: dok.tgl_dok
              ? moment(dok.tgl_dok, 'YYYY-MM-DD').format('YYYY-MM-DD')
              : null,
            urlFile: dok.filepath_dok,
          }))
        : [],
      statusReqdo: {
        name: statusDO.name,
        datetime: moment(statusDO.datetime_status, 'DD-MM-YYYY HH:mm:ss')
          .tz(data.timezone)
          .format('DD-MM-YYYY HH:mm:ss'),
      },
    };
    return response;
  }

  async getDataDraft(idDo: number) {
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

        td_reqdo_status: {
          select: {
            name: true,
            datetime_status: true,
            note: true,
          },
        },
      },
      where: {
        id: idDo,
      },
    });
    if (!data) {
      throw new NotFoundException(`DO Data Draft by Id = ${idDo} not found!`);
    }

    return data;
  }

  // GET DO DETAIL SMART CONTRACT
  async getDoDetailSC(username: string, orderId: string) {
    const headerData = await this.prisma.td_reqdo_header_form.findFirst({
      where: {
        order_id: orderId,
      },
    });

    if (!headerData) {
      throw new NotFoundException(
        `Header Data by Order Id = ${orderId} not found`,
      );
    }
    const data = await this.smartContractService.getDoDetailData(orderId);

    const timezone = headerData.timezone;
    const result = {
      requestDetailForm: {
        requestorType: data.requestDetail.requestor.requestorType,
        requestorName: data.requestDetail.requestor.requestorName,
        requestorNib: data.requestDetail.requestor.nib,
        requestorNpwp: data.requestDetail.requestor.npwp,
        requestorAlamat: data.requestDetail.requestor.requestorAddress,
        requestorFile: data.requestDetail.requestor.urlFile,
        shippingLine: [
          data.requestDetail.shippingLine.shippingType,
          data.requestDetail.shippingLine.shippingDetail,
        ].join(' | '),
        vesselName: data.requestDetail.shippingLine.vesselName,
        voyageNumber: data.requestDetail.shippingLine.voyageNumber,
        blNumber: data.requestDetail.document.ladingBillNumber,
        blDate: data.requestDetail.document.ladingBillDate
          ? moment(
              new Date(Date.parse(data.requestDetail.document.ladingBillDate)),
            ).format('YYYY-MM-DD')
          : null,
        blType: data.requestDetail.document.ladingBillType,
        blFile: data.requestDetail.document.urlFile,
        bc11Date: data.requestDetail.document.bc11Date
          ? moment(
              new Date(Date.parse(data.requestDetail.document.bc11Date)),
              'YYYY-MM-DD',
            ).format('YYYY-MM-DD')
          : null,
        bc11Number: data.requestDetail.document.bc11Number || '',
        posNumber: data.requestDetail.document.posNumber || '',
        reqdoExp:
          data.requestDetail.shippingLine.doExpired &&
          data.requestDetail.shippingLine.doExpired !== 'null'
            ? moment(
                new Date(Date.parse(data.requestDetail.shippingLine.doExpired)),
                'YYYY-MM-DD',
              ).format('YYYY-MM-DD')
            : null,
        metodeBayar: data.requestDetail.payment,
        callSign: data.requestDetail.callSign || '',
        doReleaseDate:
          data.requestDetail.doReleaseDate &&
          data.requestDetail.doReleaseDate !== 'null'
            ? moment(
                new Date(Date.parse(data.requestDetail.doReleaseDate)),
                'YYYY-MM-DD',
              ).format('YYYY-MM-DD')
            : null,
        doReleaseNumber: data.requestDetail.doReleaseNo || '',
        doExp:
          data.requestDetail.doExpiredDate &&
          data.requestDetail.doExpiredDate !== 'null'
            ? moment(
                new Date(Date.parse(data.requestDetail.doExpiredDate)),
                'YYYY-MM-DD',
              ).format('YYYY-MM-DD')
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
        portLoading: data.location.locationType[0].portDetail,
        placeDischarge: data.location.locationType[1].portDetail,
        placeDestination: data.location.locationType[2].portDetail,
      },
      containerDetailForm:
        data.cargoDetail.container !== undefined
          ? data.cargoDetail.container.map((item) => ({
              Id: item.Id,
              containerNumber: item.containerNo,
              containerSeal: item.sealNo,
              sizeType: item.sizeType.kodeSize,
              grossWeightAmount: item.grossWeight.amount,
              grossWeightUnit: item.grossWeight.unit,
              ownership: item.ownership,
              depoForm: {
                Id:
                  item.depoDetail.depoId && item.depoDetail.depoId !== undefined
                    ? item.depoDetail.depoId
                    : null,
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
              Id: item.Id,
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
        data.vinDetail !== undefined
          ? {
              ladingBillNumber: data.vinDetail.ladingBillNumber,
              vinData: data.vinDetail.vinData,
            }
          : {},
      paymentDetailForm: data.paymentDetail.invoice.map((inv) => ({
        invoiceNumber: inv.invoiceNo,
        invoiceDate: inv.invoiceDate
          ? moment(new Date(Date.parse(inv.invoiceDate)), 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            )
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
            ? moment(
                new Date(Date.parse(dok.documentDate)),
                'YYYY-MM-DD',
              ).format('YYYY-MM-DD')
            : null,
          urlFile: dok.urlFile,
        }),
      ),
      statusReqdo: {
        name: data.status,
        datetime: moment(
          new Date(Date.parse(data.statusDate)),
          'DD-MM-YYYY HH:mm:ss',
        )
          .tz(timezone)
          .format('DD-MM-YYYY HH:mm:ss'),
      },
    };
    return result;
  }

  async getHeaderData(idDo: number) {
    if (!!idDo) {
      const data = await this.prisma.td_reqdo_header_form.findUnique({
        where: {
          id: idDo,
        },
      });
      if (!data) {
        throw new NotFoundException(`${idDo} is not found`);
      }
      return data;
    }
  }

  async updateHeaderData(idDo: number, reqdoNum: string, orderId: string) {
    // check if DO exist
    const headerData = await this.getHeaderData(idDo);
    // get status do from smart contract
    const statusDo = await this.smartContractService.getStatusDo(orderId);

    const updatedHeader = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: +idDo,
      },
      data: {
        no_reqdo: reqdoNum,
        order_id: orderId,
        tgl_reqdo: new Date(Date.parse(statusDo.datetime)),
        td_reqdo_status: {
          create: {
            name: statusDo.status,
            datetime_status: new Date(Date.parse(statusDo.datetime)),
          },
        },
      },
    });

    return updatedHeader;
  }

  async printDo(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);
    // get header data
    const headerDo = await this.getHeaderData(idDo);
    // get do detail
    const doData = await this.getDoDetail(idDo, token);
    // convert data from json to pdf
    const type = headerDo.request_type === 1 ? 'container' : 'cargo';
    // generate pdf
    const filename = `dosp2_${headerDo.id}.pdf`;
    const dirpath = `./assets/upload/pdf`;
    const filepath = `./assets/upload/pdf/${filename}`;
    const bodyPdf = jsonToBodyPdf(doData, type, headerDo.id);
    const printer = new pdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(bodyPdf);
    // check directory exist
    if (!fs.existsSync(dirpath)) {
      fs.mkdirSync(dirpath, { recursive: true });
    }
    const write = fs.createWriteStream(filepath);
    pdfDoc.pipe(write);
    fs.createReadStream(filepath);
    // write.on('finish', () => {
    //   fs.createReadStream(filepath).pipe(res);
    // });
    pdfDoc.end();
  }

  async createRequestDetail(data: RequestDetail, token: string) {
    const userInfo = await this.userService.getDetail(token);
    const created_by = userInfo.sub;

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not CO',
      );
    }

    const result = await this.prisma.td_reqdo_header_form.create({
      data: {
        no_reqdo: generateNoReq(
          data.shippingLine.shippingType.split('|')[0].trim(),
        ),
        order_id: uuidv4(),
        request_type: data.requestType,
        created_by,
        tgl_reqdo: new Date(),
        timezone: 'Asia/Jakarta',
        td_do_req_form: {
          create: {
            created_by,
            id_metode_bayar: +data.payment || 999,
            id_shippingline: data.shippingLine.shippingType,
            nama_vessel: data.shippingLine.vesselName || '',
            no_voyage: data.shippingLine.voyageNumber || '',
            pos_number: data.document.posNumber || '',
            tgl_reqdo_exp: data.shippingLine.doExpired
              ? new Date(data.shippingLine.doExpired)
              : null,
            no_bc11: data.document.bc11Number || '',
            tanggal_bc11: data.document.bc11Date
              ? new Date(data.document.bc11Date)
              : null,
          },
        },
        td_do_requestor_form: {
          create: {
            id_jenis_requestor: +data.requestor.requestorType,
            alamat:
              userInfo.organization.address.address +
              ', ' +
              userInfo.organization.address.city,
            created_by,
            nama: userInfo.profile.details.full_name,
            nib: userInfo.organization.nib || '',
            npwp: userInfo.organization.npwp || '',
            filepath_suratkuasa: data.requestor.urlFile || '',
          },
        },
        td_do_bl_form: {
          create: {
            no_bl: data.document.ladingBillNumber,
            id_jenis_bl: data.document.ladingBillType,
            created_by,
            tgl_bl: new Date(data.document.ladingBillDate),
            filepath_dok: data.document.urlFile || '',
          },
        },
        td_parties_detail_form: {
          create: {
            id_negara_loading: '',
            id_port_loading: '',
            id_port_discharge: '',
            id_port_destination: '',
            nama_consignee: '',
            npwp_consignee: '',
            nama_notifyparty: '',
            npwp_notifyparty: '',
            nama_shipper: '',
            created_by,
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
    return result;
  }

  async getRequestDetail(idDo: number, token: string) {
    const userInfo = await this.userService.getUserDB(token);

    const data = await this.prisma.td_reqdo_header_form.findUnique({
      include: {
        td_do_requestor_form: {
          select: {
            id_jenis_requestor: true,
            filepath_suratkuasa: true,
          },
        },
        td_do_req_form: {
          select: {
            id_metode_bayar: true,
            id_shippingline: true,
            nama_vessel: true,
            no_voyage: true,
            tgl_reqdo_exp: true,
            pos_number: true,
            no_bc11: true,
            tanggal_bc11: true,
          },
        },
        td_do_bl_form: {
          select: {
            id_jenis_bl: true,
            no_bl: true,
            tgl_bl: true,
            filepath_dok: true,
          },
        },
      },
      where: {
        id: idDo,
      },
    });

    if (!data) {
      throw new NotFoundException(
        `Request DO Header by Id = ${idDo} not found!`,
      );
    }

    const response = {
      requestDetailForm: {
        requestorType: data.td_do_requestor_form.id_jenis_requestor,
        requestorFile: data.td_do_requestor_form.filepath_suratkuasa,
        shippingLine: data.td_do_req_form.id_shippingline,
        vesselName: data.td_do_req_form.nama_vessel || '',
        voyageNumber: data.td_do_req_form.no_voyage || '',
        blNumber: data.td_do_bl_form.no_bl || '',
        blDate: data.td_do_bl_form.tgl_bl
          ? moment(data.td_do_bl_form.tgl_bl, 'YYYY-MM-DD').format('YYYY-MM-DD')
          : null,
        blType: data.td_do_bl_form.id_jenis_bl || '',
        blFile: data.td_do_bl_form.filepath_dok || '',
        bc11Date: data.td_do_req_form.tanggal_bc11
          ? moment(data.td_do_req_form.tanggal_bc11, 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            )
          : null,
        bc11Number: data.td_do_req_form.no_bc11 || '',
        posNumber: data.td_do_req_form.pos_number || '',
        reqdoExp: data.td_do_req_form.tgl_reqdo_exp
          ? moment(data.td_do_req_form.tgl_reqdo_exp, 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            )
          : null,
        metodeBayar: data.td_do_req_form.id_metode_bayar || '',
      },
    };
    return response;
  }

  async updateRequestDetail(
    idDo: number,
    data: RequestDetail,
    token: string,
    status: StatusDo,
  ) {
    const userInfo = await this.userService.getDetail(token);
    const created_by = userInfo.sub;

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not CO',
      );
    }

    if (!['Processed', 'Draft'].includes(status)) {
      throw new BadRequestException(
        `Status is invalid, must be Processed or Draft`,
      );
    }

    const result = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: idDo,
      },
      data: {
        td_do_req_form: {
          update: {
            created_by,
            id_metode_bayar: +data.payment || 999,
            id_shippingline: data.shippingLine.shippingType,
            nama_vessel: data.shippingLine.vesselName || '',
            no_voyage: data.shippingLine.voyageNumber || '',
            pos_number: data.document.posNumber || '',
            tgl_reqdo_exp: data.shippingLine.doExpired
              ? new Date(data.shippingLine.doExpired)
              : null,
            no_bc11: data.document.bc11Number || '',
            tanggal_bc11: data.document.bc11Date
              ? new Date(data.document.bc11Date)
              : null,
            id_terminal_op: data.terminalOp,
            call_sign: data.callSign,
            no_do_release: data.doReleaseNo,
            tgl_do_exp: data.doExpiredDate
              ? new Date(data.doExpiredDate)
              : null,
            tgl_do_release: data.doReleaseDate
              ? new Date(data.doReleaseDate)
              : null,
          },
        },
        td_do_requestor_form: {
          update: {
            id_jenis_requestor: +data.requestor.requestorType,
            filepath_suratkuasa: data.requestor.urlFile || '',
          },
        },
        td_do_bl_form: {
          update: {
            no_bl: data.document.ladingBillNumber,
            id_jenis_bl: data.document.ladingBillType,
            tgl_bl: new Date(data.document.ladingBillDate),
            filepath_dok: data.document.urlFile || '',
          },
        },
      },
    });
    await this.updateStatusDo(idDo, token, status);
    return result;
  }

  async createRequestPartiesDetail(
    idDo: number,
    data: RequestPartiesDetail,
    token: string,
  ) {
    const userInfo = await this.userService.getDetail(token);
    const created_by = userInfo.sub;

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not CO',
      );
    }

    const result = await this.prisma.td_reqdo_header_form.update({
      data: {
        td_do_req_form: {
          update: {
            created_by,
            id_metode_bayar: +data.requestDetail.payment || 999,
            id_shippingline: data.requestDetail.shippingLine.shippingType,
            nama_vessel: data.requestDetail.shippingLine.vesselName || '',
            no_voyage: data.requestDetail.shippingLine.voyageNumber || '',
            pos_number: data.requestDetail.document.posNumber || '',
            tgl_reqdo_exp: data.requestDetail.shippingLine.doExpired
              ? new Date(data.requestDetail.shippingLine.doExpired)
              : null,
            no_bc11: data.requestDetail.document.bc11Number || '',
            tanggal_bc11: data.requestDetail.document.bc11Date
              ? new Date(data.requestDetail.document.bc11Date)
              : null,
          },
        },
        td_do_requestor_form: {
          update: {
            id_jenis_requestor: +data.requestDetail.requestor.requestorType,
            filepath_suratkuasa: data.requestDetail.requestor.urlFile || '',
          },
        },
        td_do_bl_form: {
          update: {
            no_bl: data.requestDetail.document.ladingBillNumber || '',
            id_jenis_bl: data.requestDetail.document.ladingBillType || '',
            created_by,
            tgl_bl: new Date(data.requestDetail.document.ladingBillDate),
            filepath_dok: data.requestDetail.document.urlFile || '',
          },
        },
        td_parties_detail_form: {
          upsert: {
            create: {
              id_negara_loading:
                data.location.locationType[0].countryCode || '',
              id_port_loading: data.location.locationType[0].portDetail || '',
              id_port_discharge: data.location.locationType[1].portDetail || '',
              id_port_destination:
                data.location.locationType[2].portDetail || '',
              nama_consignee: data.parties.consignee.name || '',
              npwp_consignee: data.parties.consignee.npwp || '',
              nama_notifyparty: data.parties.notifyParty.name || '',
              npwp_notifyparty: data.parties.notifyParty.npwp || '',
              nama_shipper: data.parties.shipper.name || '',
              created_by,
            },
            update: {
              id_negara_loading:
                data.location.locationType[0].countryCode || '',
              id_port_loading: data.location.locationType[0].portDetail || '',
              id_port_discharge: data.location.locationType[1].portDetail || '',
              id_port_destination:
                data.location.locationType[2].portDetail || '',
              nama_shipper: data.parties.shipper.name || '',
              nama_consignee: data.parties.consignee.name || '',
              npwp_consignee: data.parties.consignee.npwp || '',
              nama_notifyparty: data.parties.notifyParty.name || '',
              npwp_notifyparty: data.parties.notifyParty.npwp || '',
            },
            where: {
              id_reqdo_header: idDo,
            },
          },
        },
      },
      where: {
        id: idDo,
      },
    });
    if (!result) {
      throw new NotFoundException(
        `Request header DO by Id = ${idDo} not found!`,
      );
    }
    await this.updateStatusDo(idDo, token, 'Draft');
    return result;
  }

  async getRequestPartiesDetail(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);

    const data = await this.prisma.td_reqdo_header_form.findUnique({
      include: {
        td_do_requestor_form: {
          select: {
            id_jenis_requestor: true,
            filepath_suratkuasa: true,
          },
        },
        td_do_req_form: {
          select: {
            id_metode_bayar: true,
            id_shippingline: true,
            nama_vessel: true,
            no_voyage: true,
            tgl_reqdo_exp: true,
            pos_number: true,
            no_bc11: true,
            tanggal_bc11: true,
          },
        },
        td_do_bl_form: {
          select: {
            id_jenis_bl: true,
            no_bl: true,
            tgl_bl: true,
            filepath_dok: true,
          },
        },
        td_parties_detail_form: {
          select: {
            id_negara_loading: true,
            id_port_destination: true,
            id_port_discharge: true,
            id_port_loading: true,
            nama_consignee: true,
            npwp_consignee: true,
            nama_notifyparty: true,
            npwp_notifyparty: true,
            nama_shipper: true,
          },
        },
      },
      where: {
        id: idDo,
      },
    });

    if (!data) {
      throw new NotFoundException(
        `Request Header DO by Id = ${idDo} not found`,
      );
    }

    const response = {
      requestDetailForm: {
        requestorType: data.td_do_requestor_form.id_jenis_requestor,
        requestorFile: data.td_do_requestor_form.filepath_suratkuasa,
        shippingLine: data.td_do_req_form.id_shippingline,
        vesselName: data.td_do_req_form.nama_vessel || '',
        voyageNumber: data.td_do_req_form.no_voyage || '',
        blNumber: data.td_do_bl_form.no_bl || '',
        blDate: data.td_do_bl_form.tgl_bl
          ? moment(data.td_do_bl_form.tgl_bl, 'YYYY-MM-DD').format('YYYY-MM-DD')
          : null,
        blType: data.td_do_bl_form.id_jenis_bl || '',
        blFile: data.td_do_bl_form.filepath_dok || '',
        bc11Date: data.td_do_req_form.tanggal_bc11
          ? moment(data.td_do_req_form.tanggal_bc11, 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            )
          : null,
        bc11Number: data.td_do_req_form.no_bc11 || '',
        posNumber: data.td_do_req_form.pos_number || '',
        reqdoExp: data.td_do_req_form.tgl_reqdo_exp
          ? moment(data.td_do_req_form.tgl_reqdo_exp, 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            )
          : null,
        metodeBayar: data.td_do_req_form.id_metode_bayar || '',
      },
      partiesDetailForm: {
        shipperName: data.td_parties_detail_form.nama_shipper || '',
        consigneeName: data.td_parties_detail_form.nama_consignee || '',
        consigneeNpwp: data.td_parties_detail_form.npwp_consignee || '',
        notifyPartyName: data.td_parties_detail_form.nama_notifyparty || '',
        notifyPartyNpwp: data.td_parties_detail_form.npwp_notifyparty || '',
        placeLoading: data.td_parties_detail_form.id_negara_loading || '',
        portLoading: data.td_parties_detail_form.id_port_loading || '',
        placeDischarge: data.td_parties_detail_form.id_port_discharge || '',
        placeDestination: data.td_parties_detail_form.id_port_destination || '',
      },
    };
    return response;
  }

  async createContainerDetail(
    idDo: number,
    data: Container[],
    token: string,
    status: StatusDo,
  ) {
    const userInfo = await this.userService.getDetail(token);
    const created_by = userInfo.sub;
    const queryOwnership = await this.flagService.findAll(token, 'ownership');

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not CO',
      );
    }

    if (!['Processed', 'Draft'].includes(status)) {
      throw new BadRequestException(
        `Status is invalid, must be Processed or Draft`,
      );
    }

    const headerData = await this.getHeaderData(+idDo);

    // delete all container data
    if (data.length === 0) {
      await this.prisma.td_do_kontainer_form.deleteMany({
        where: {
          id_reqdo_header: idDo,
        },
      });

      return await this.updateStatusDo(idDo, token, 'Draft');
    }

    const promises = data.map(async (item) => {
      if (!!+item.Id) {
        const con = await this.prisma.td_do_kontainer_form.findUnique({
          where: {
            id: +item.Id,
          },
        });
        if (con) {
          return this.prisma.td_do_kontainer_form.update({
            where: {
              id: con.id,
            },
            data: {
              id_reqdo_header: idDo,
              created_by,
              gross_weight: item.grossWeight.amount,
              no_kontainer: item.containerNo,
              id_sizeType: item.sizeType.kodeSize,
              id_ownership: +queryOwnership.data.filter(
                (own) =>
                  own.uraian ===
                  (Array.isArray(item.ownership)
                    ? item.ownership[0]
                    : item.ownership),
              )[0].kode,
              id_gross_weight_unit: item.grossWeight.unit,
              td_depo: {
                update: {
                  alamat: item.depoDetail.alamat,
                  deskripsi: item.depoDetail.depoName,
                  id_kabkota: item.depoDetail.kotaDepo,
                  kode_pos: item.depoDetail.kodePos,
                  no_telp: item.depoDetail.noTelp,
                  npwp: item.depoDetail.depoNpwp,
                },
              },
              seals: {
                deleteMany: {},
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
        }
      } else {
        return this.prisma.td_do_kontainer_form.create({
          data: {
            id_reqdo_header: idDo,
            created_by,
            gross_weight: item.grossWeight.amount,
            no_kontainer: item.containerNo,
            id_sizeType: item.sizeType.kodeSize,
            id_ownership: +queryOwnership.data.filter(
              (own) =>
                own.uraian ===
                (Array.isArray(item.ownership)
                  ? item.ownership[0]
                  : item.ownership),
            )[0].kode,
            id_gross_weight_unit: item.grossWeight.unit,
            td_depo: {
              create: {
                created_by: userInfo.sub,
                alamat: '',
                deskripsi: '',
                id_kabkota: '',
                kode_pos: '',
                no_telp: '',
                npwp: '',
              },
            },
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
      }
    });

    // Using Promise.all to wait for all promises to resolve
    Promise.all(promises)
      .then((results) => {
        console.log('All promises resolved successfully');
      })
      .catch((error) => {
        console.error('Error in one or more promises:', error);
      });

    await this.updateStatusDo(idDo, token, status);
  }

  async getContainerDetail(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);
    const queryOwnership = await this.flagService.findAll(token, 'ownership');

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not CO',
      );
    }

    const data = await this.prisma.td_reqdo_header_form.findUnique({
      include: {
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
      },
      where: {
        id: idDo,
      },
    });

    if (!data) {
      throw new NotFoundException(
        `Request Header Data by Id = ${idDo} not found!`,
      );
    }

    const response = {
      containerDetailForm: !!data.td_do_kontainer_form.length
        ? data.td_do_kontainer_form.map((data) => ({
            Id: data.id,
            containerNumber: data.no_kontainer,
            containerSeal: data.seals.map((item) => item.seal.no_seal),
            sizeType: data.id_sizeType,
            grossWeightAmount: data.gross_weight,
            grossWeightUnit: data.id_gross_weight_unit,
            ownership: queryOwnership.data.filter(
              (own) => +own.kode === data.id_ownership,
            )[0].uraian,
            depoForm: {
              Id: data.td_depo?.id,
              nama: data.td_depo?.deskripsi,
              npwp: data.td_depo?.npwp,
              alamat: data.td_depo?.alamat,
              noTelp: data.td_depo?.no_telp,
              kota: data.td_depo?.id_kabkota,
              kodePos: data.td_depo?.kode_pos,
            },
          }))
        : [],
    };

    return response;
  }

  async deleteContainerDetail(id: number, token: string) {
    const userInfo = await this.userService.getDetail(token);

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not CO',
      );
    }

    const con = await this.prisma.td_do_kontainer_form.findUnique({
      where: {
        id: id,
      },
    });
    if (!con) {
      throw new NotFoundException(`Container data by Id = ${id} not found!`);
    }

    return await this.prisma.td_do_kontainer_form.delete({
      where: {
        id: +id,
      },
    });
  }

  async createPaymentSupportingDetail(
    idDo: number,
    payload: PaymentSupportingDetail,
    token: string,
  ) {
    const userInfo = await this.userService.getDetail(token);
    const created_by = userInfo.sub;

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not CO',
      );
    }

    const headerData = await this.getHeaderData(+idDo);

    const dataDokumen = payload.supportingDocument.documentType.map((item) => {
      const data: Partial<td_do_dok_form> = {
        created_by,
        id_jenis_dok: item.document,
        filepath_dok: item.urlFile,
        no_dok: item.documentNo,
        tgl_dok: new Date(item.documentDate),
      };

      return data;
    });

    const dataInvoice = payload.paymentDetail.invoice.map((item) => {
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

    const result = await this.prisma.td_reqdo_header_form.update({
      data: {
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
      },
      where: {
        id: idDo,
      },
    });
    await this.updateStatusDo(idDo, token, 'Draft');
    return result;
  }

  async getPaymentSupportingDetail(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);

    const data = await this.prisma.td_reqdo_header_form.findUnique({
      include: {
        td_do_invoice_form: {
          select: {
            id: true,
            id_bank: true,
            id_currency: true,
            filepath_buktibayar: true,
            no_invoice: true,
            no_rekening: true,
            tgl_invoice: true,
            total_payment: true,
          },
        },
        td_do_dok_form: {
          select: {
            id: true,
            id_jenis_dok: true,
            filepath_dok: true,
            no_dok: true,
            tgl_dok: true,
          },
        },
      },
      where: {
        id: idDo,
      },
    });

    const response = {
      paymentDetailForm: data.td_do_invoice_form.length
        ? data.td_do_invoice_form.map((inv) => ({
            invoiceNumber: inv.no_invoice,
            invoiceDate: inv.tgl_invoice
              ? moment(inv.tgl_invoice).format('YYYY-MM-DD')
              : null,
            currency: inv.id_currency,
            totalPayment: inv.total_payment,
            bank: inv.id_bank,
            accountNumber: inv.no_rekening,
            urlFile: inv.filepath_buktibayar,
          }))
        : [],
      supportingDocumentForm: data.td_do_dok_form.length
        ? data.td_do_dok_form.map((dok) => ({
            documentType: dok.id_jenis_dok,
            documentNumber: dok.no_dok,
            documentDate: dok.tgl_dok
              ? moment(dok.tgl_dok, 'YYYY-MM-DD').format('YYYY-MM-DD')
              : null,
            urlFile: dok.filepath_dok,
          }))
        : [],
    };
    return response;
  }

  async createCargoVinDetail(
    idDo: number,
    data: CargoVinDetail,
    token: string,
  ) {
    const userInfo = await this.userService.getDetail(token);
    const created_by = userInfo.sub;

    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not CO',
      );
    }

    const headerData = await this.getHeaderData(+idDo);

    const dataNonKontainer = data.nonContainer.map((item) => {
      const data: Partial<td_do_nonkontainer_form> = {
        created_by,
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

    const dataVin = data.vinDetail.vinData.map((vin) => {
      const data: Partial<td_do_vin> = {
        no_vin: vin.vinNumber,
      };
      return data;
    });

    const result = await this.prisma.td_reqdo_header_form.update({
      where: {
        id: idDo,
      },
      data: {
        td_do_bl_form: {
          update: {
            data: {
              no_bl: data.vinDetail.ladingBillNumber,
              do_vin: {
                deleteMany: {},
                createMany: {
                  data: dataVin as td_do_vin[],
                },
              },
            },
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
    await this.updateStatusDo(idDo, token, 'Draft');
    return result;
  }

  async getCargoVinDetail(idDo: number, token: string) {
    const userInfo = await this.userService.getDetail(token);

    const data = await this.prisma.td_reqdo_header_form.findUnique({
      include: {
        td_do_bl_form: {
          select: {
            no_bl: true,
            do_vin: true,
          },
        },
        td_do_nonkontainer_form: true,
      },
      where: {
        id: idDo,
      },
    });

    if (!data) {
      throw new NotFoundException(
        `Request Header DO b Id = ${idDo} not found!`,
      );
    }

    const response = {
      nonContainerDetailForm: data.td_do_nonkontainer_form.length
        ? data.td_do_nonkontainer_form.map((data) => ({
            Id: data.id,
            goodsDescription: data.good_desc,
            packageQuantityAmount: data.package_qty,
            packageQuantityUnit: data.id_package_unit,
            grossWeightAmount: data.gross_weight,
            grossWeightUnit: data.id_gross_weight_unit,
            measurementVolume: data.measurement_vol,
            measurementUnit: data.measurement_unit,
          }))
        : [],
      vinDetailForm: {
        ladingBillNumber: data.td_do_bl_form.no_bl,
        vinData: data.td_do_bl_form.do_vin.length
          ? data.td_do_bl_form.do_vin.map((vin) => ({
              Id: vin.id,
              vinNumber: vin.no_vin,
            }))
          : [],
      },
    };

    return response;
  }

  async cancelDo(idDo: number, note: string, token: string) {
    const userInfo = await this.userService.getDetail(token);

    // CHECK IF USER ROLE IS CO
    if (!userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not SL',
      );
    }

    const headerDo = await this.getHeaderData(idDo);

    if (!headerDo) {
      throw new NotFoundException(`DO Data by Id = ${idDo} is not exist`);
    }

    const statusDO = await this.smartContractService.getStatusDo(
      headerDo.order_id,
    );

    const dataDO = await this.getDoDetailSC(userInfo.sub, headerDo.order_id);

    if (statusDO.status !== 'Released') {
      throw new BadRequestException(
        `Cannot update status DO to Cancelled, last status DO is not Released`,
      );
    }

    // update status DO SL from 'Released' to 'Cancelled'
    const result = await this.smartContractService.updateStatusDoSl(
      headerDo.order_id,
      'Cancelled',
      note,
    );

    await this.updateStatusDo(idDo, token, 'Cancelled', note);

    return result;
  }

  async extendDo(idDo: number, extendDate: string, token: string) {
    const userInfo = await this.userService.getDetail(token);
    // CHECK IF USER ROLE IS CO
    if (userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(
        'Cannot update DO container, Role is not CO',
      );
    }

    const headerDo = await this.getHeaderData(idDo);

    if (!headerDo) {
      throw new NotFoundException(`DO Data by Id = ${idDo} is not exist`);
    }

    const statusDO = await this.smartContractService.getStatusDo(
      headerDo.order_id,
    );

    const data = await this.smartContractService.getDoDetailData(
      headerDo.order_id,
    );

    data.requestDetail.shippingLine.doExpired = extendDate;

    if (statusDO.status !== 'Released') {
      throw new BadRequestException(
        `Cannot update status DO to Cancelled, last status DO is not Released`,
      );
    }

    const result = await this.smartContractService.updateDoCo(
      headerDo.order_id,
      data,
      'Processed',
      '',
    );
    await this.updateStatusDo(idDo, token, 'Processed', null);

    return result;
  }
}
