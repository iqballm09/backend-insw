import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestDoDto } from './dto/create-do.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  StatusDo,
  td_do_dok_form,
  td_do_invoice_form,
  td_do_kontainer_form,
} from '@prisma/client';
import * as moment from 'moment';

@Injectable()
export class DeliveryOrderService {
  constructor(private prisma: PrismaService) {}

  async getAllDo() {
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

    return data.map((item) => ({
      id: item.id,
      requestNumber: item.no_reqdo,
      requestTime: moment(item.tgl_reqdo).format('DD-MM-YYYY HH:mm:ss'),
      blNumber: item.td_do_bl_form.no_bl,
      blDate: moment(item.td_do_bl_form.tgl_bl).format('DD-MM-YYYY'),
      requestName: item.td_do_requestor_form.nama,
      shippingLine: item.td_do_req_form.id_shippingline,
      status: item.td_reqdo_status[0].name,
      isContainer: item.request_type == 1,
    }));
  }

  async getDoDetail(idDo: number) {
    const data = await this.prisma.td_reqdo_header_form.findUnique({
      include: {
        td_do_requestor_form: {
          select: {
            id_jenis_requestor: true,
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

    // TODO: POPULATE RESPONSE
    const response = {
      requestDetailForm: {
        // TODO: ADD FIELD
        requestorType: data.td_do_requestor_form.id_jenis_requestor,
      },
      partiesDetailForm: {
        // TODO: ADD FIELD
      },
      containerDetailForm: [
        {
          // TODO: ADD FIELD
        },
      ],
      paymentDetailForm: [
        {
          // TODO: ADD FIELD
        },
      ],
      supportingDocumentForm: [
        {
          // TODO: ADD FIELD
        },
      ],
    };
    return data;
  }

  // TODO: CREATE NON KONTAINER
  async createNonKontainer() {}

  async createKontainer(data: RequestDoDto, status: StatusDo) {
    const created_by = 'admin_demo_co';

    if (!Object.keys(StatusDo).includes(status)) {
      throw new BadRequestException(
        'Status not allowed, only allowed:' + Object.keys(StatusDo).join(', '),
      );
    }

    if (
      created_by == 'admin_demo_co' &&
      ['Checking', 'Released', 'Rejected'].includes(status)
    ) {
      throw new ForbiddenException('Cargo owner not allowed for this action');
    }

    // CHECK IF USER IS FF AND SURAT KUASA EXIST
    if (
      data.requestDetail.requestor.requestorType == '2' &&
      !data.requestDetail.requestor.urlFile
    ) {
      throw new BadRequestException('Freight Forwarder required surat kuasa');
    }

    const dataKontainer = data.cargoDetail.container.map((item) => {
      const data: Partial<td_do_kontainer_form> = {
        created_by,
        gross_weight: item.grossWeight.amount,
        no_kontainer: item.containerNo,
        id_sizeType: item.sizeType.size,
        id_ownership: +item.ownership,
        id_gross_weight_unit: item.grossWeight.unit,
      };

      return data;
    });

    const dataDokumen = data.supportingDocument.documentType.map((item) => {
      const data: Partial<td_do_dok_form> = {
        created_by,
        id_jenis_dok: +item.document,
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
        id_bank: +item.bankId,
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
        created_by,
        td_do_requestor_form: {
          create: {
            id_jenis_requestor: +data.requestDetail.requestor.requestorType,
            alamat: data.requestDetail.requestor.requestorAddress,
            created_by,
            nama: data.requestDetail.requestor.requestorName,
            nib: data.requestDetail.requestor.nib,
            filepath_suratkuasa: data.requestDetail.requestor.urlFile,
          },
        },
        td_do_bl_form: {
          create: {
            created_by,
            filepath_dok: data.requestDetail.document.urlFile,
            id_jenis_bl: +data.requestDetail.document.ladingBillType,
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
            tgl_reqdo_exp: new Date(data.requestDetail.shippingLine.doExpired),
          },
        },
        td_do_kontainer_form: {
          createMany: {
            data: dataKontainer as td_do_kontainer_form[],
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
            name: status,
          },
        },
      },
    });
    return {
      messsage: 'success',
      data: createdDo,
    };
  }
}
