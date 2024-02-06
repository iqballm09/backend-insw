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
  sealsOnKontainers,
  td_do_dok_form,
  td_do_invoice_form,
  td_do_kontainer_form,
  td_do_kontainer_seal,
  td_do_nonkontainer_form,
  td_do_vin,
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

    // TODO: POPULATE RESPONSE
    const response = {
      requestDetailForm: {
        // TODO: ADD FIELD
        requestorType: data.td_do_requestor_form.id_jenis_requestor,
        shippingLine: data.td_do_req_form.id_shippingline,
        vesselName: data.td_do_req_form.nama_vessel,
        voyageNumber: data.td_do_req_form.no_voyage,
        blNumber: data.td_do_bl_form.no_bl,
        blDate: moment(data.td_do_bl_form.tgl_bl).format('YYYY-MM-DD'),
        blType: data.td_do_bl_form.id_jenis_bl,
        blFile: data.td_do_bl_form.filepath_dok,
        bc11Date: data.td_do_req_form.tanggal_bc11,
        bc11Number: data.td_do_req_form.no_bc11,
        kodePos: data.td_do_req_form.kode_pos,
        reqdoExp: data.td_do_req_form.tgl_reqdo_exp,
        metodeBayar: data.td_do_req_form.id_metode_bayar,
        callSign: data.td_do_req_form.call_sign,
        doReleaseDate: data.td_do_req_form.tgl_do_release,
        doReleaseNumber: data.td_do_req_form.no_do_release,
        doExp: data.td_do_req_form.tgl_do_exp,
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
          nama: data.td_depo?.kode_depo,
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
        invoiceDate: inv.tgl_invoice,
        currency: inv.id_currency,
        totalPayment: inv.total_payment,
        bank: inv.id_bank,
        accountNumber: inv.no_rekening,
        urlFile: inv.filepath_buktibayar,
      })),
      supportingDocumentForm: data.td_do_dok_form.map((dok) => ({
        documentType: dok.id_jenis_dok,
        documentNumber: dok.no_dok,
        documentDate: dok.tgl_dok,
        urlFile: dok.filepath_dok,
      })),
    };
    return response;
  }

  // async deleteDo(idDo: number) {
  //   const deleted = await this.prisma.td_reqdo_header_form.delete({
  //     where: {
  //       id: idDo,
  //     },
  //   });
  // }

  // TODO: CREATE NON KONTAINER
  async createNonKontainer(data: RequestDoDto, status?: StatusDo) {
    const created_by = 'admin_demo_co';
    // CHECK IF USER IS FF AND SURAT KUASA EXIST
    if (
      data.requestDetail.requestor.requestorType == '2' &&
      !data.requestDetail.requestor.urlFile
    ) {
      throw new BadRequestException('Freight Forwarder required surat kuasa');
    }

    const dataNonKontainer = data.cargoDetail.nonContainer.map((item) => {
      const data: Partial<td_do_nonkontainer_form> = {
        created_by,
        gross_weight: item.grossWeight.amount,
        package_qty: item.packageQuantity.amount,
        measurement_vol: item.measurementVolume.amount,
        measurement_unit: item.measurementVolume.unit,
        good_desc: item.goodsDescription,
        id_gross_weight_unit: item.grossWeight.unit,
        id_package_unit: item.packageQuantity.unit,
      };
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
            id_jenis_bl: +data.requestDetail.document.ladingBillType,
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

  async createKontainer(data: RequestDoDto, status?: StatusDo) {
    const created_by = 'admin_demo_co';

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
          id_sizeType: item.sizeType.size,
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
}
