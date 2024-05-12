import { ApiProperty } from '@nestjs/swagger';
import {
  createContainerData,
  createNonContainerData,
  updateContainerData,
  updateDoSLData,
  updateNonContainerData,
} from '../example/read_data';

class Requestor {
  requestorType: string;
  urlFile: string;
  npwp: string;
  nib: string;
  requestorName: string;
  requestorAddress: string;
  requestorId: string;
}

class ShippingLine {
  shippingType: string;
  shippingDetail?: string;
  doExpired?: string;
  vesselName: string;
  voyageNumber: string;
}

class Document {
  ladingBillNumber: string;
  ladingBillDate: string;
  ladingBillType: string;
  urlFile: string;
  bc11Number?: string;
  bc11Date?: string;
  posNumber?: string;
}

class Parties {
  shipper: {
    npwp: string;
    name: string;
  };
  consignee: {
    npwp: string;
    name: string;
  };
  notifyParty: {
    npwp: string;
    name: string;
  };
}

class SizeType {
  kodeSize: string;
}

class GrossWeight {
  amount: number;
  unit: string;
}

class PackageQuantity {
  amount: number;
  unit: string;
}

class MeasurementVolume {
  amount: number;
  unit: string;
}

export class Container {
  Id?: number;
  containerNo: string;
  sealNo: string[];
  sizeType: SizeType;
  grossWeight: GrossWeight;
  ownership: string;
  depoDetail: DepoDto;
}

export class NonContainer {
  Id?: number;
  goodsDescription: string;
  packageQuantity: PackageQuantity;
  grossWeight: GrossWeight;
  measurementVolume: MeasurementVolume;
}

class LocationType {
  location: string;
  countryCode: string;
  portCode: string;
  portDetail?: string;
}

export class Invoice {
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
  bankId: string;
  accountNo: string;
  urlFile: string;
}

class DocumentType {
  document: string;
  documentNo: string;
  documentDate: string;
  urlFile: string;
}

export class VinDetail {
  ladingBillNumber: string;
  vinData: {
    Id?: number;
    vinNumber: string;
  }[];
}

export class RequestDetail {
  requestType?: number;
  requestor: Requestor;
  shippingLine: ShippingLine;
  payment: string;
  document: Document;
  requestDoNumber?: string;
  doReleaseNo?: string;
  doReleaseDate?: string;
  doExpiredDate?: string;
  callSign?: string;
  terminalOp?: string;
}

export class RequestPartiesDetail {
  requestDetail?: RequestDetail;
  parties: Parties;
  location: {
    locationType: LocationType[];
  };
}

export class PaymentSupportingDetail {
  paymentDetail?: {
    invoice?: Invoice[];
  };
  supportingDocument?: {
    documentType?: DocumentType[];
  };
}

export class CargoVinDetail {
  nonContainer?: NonContainer[];
  vinDetail?: {
    ladingBillNumber?: string;
    vinData: {
      Id?: number;
      vinNumber: string;
    }[];
  };
}

export class RequestDoDto {
  requestType: number;
  requestDetail: RequestDetail;
  parties?: Parties;
  cargoDetail?: {
    container?: Container[];
    nonContainer?: NonContainer[];
  };
  vinDetail?: VinDetail;
  location?: {
    locationType: LocationType[];
  };
  paymentDetail?: {
    invoice: Invoice[];
  };
  supportingDocument?: {
    documentType: DocumentType[];
  };
  status?: string;
  statusDate?: string;
  orderId?: string;
  statusNote?: string;
}

export class DepoDto {
  depoId?: number;
  depoName?: string;
  depoNpwp?: string;
  noTelp?: string;
  alamat?: string;
  kotaDepo?: string;
  kodePos?: string;
}

export class CargoDetailSL {
  containerNo: string;
  sizeType: SizeType;
  depoDetail?: DepoDto;
}

export class UpdateDoSLDto {
  vesselName: string;
  voyageNo: string;
  callSign: string;
  doReleaseNo?: string;
  doReleaseDate?: string;
  doExpiredDate: string;
  terminalOp: string;
  cargoDetail?: CargoDetailSL[];
  statusNote?: string;
}

export class CreateNonContainerRequestDO {
  @ApiProperty({
    example: createNonContainerData,
  })
  request: RequestDoDto;
}

export class UpdateNonContainerRequestDO {
  @ApiProperty({
    example: updateNonContainerData,
  })
  request: RequestDoDto;
}

export class CreateContainerRequestDO {
  @ApiProperty({
    example: createContainerData,
  })
  request: RequestDoDto;
}

export class UpdateContainerRequestDO {
  @ApiProperty({
    example: updateContainerData,
  })
  request: RequestDoDto;
}

export class UpdateCargoDetailSL {
  @ApiProperty({
    example: updateDoSLData,
  })
  request: UpdateDoSLDto;
}
