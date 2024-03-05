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
}

class ShippingLine {
  shippingType: string;
  doExpired: string;
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

class Container {
  containerSeq: number;
  containerNo: string;
  sealNo: string[];
  sizeType: SizeType;
  grossWeight: GrossWeight;
  ownership: string;
  depoDetail?: DepoDto;
}

class NonContainer {
  nonContainerSeq: number;
  goodsDescription: string;
  packageQuantity: PackageQuantity;
  grossWeight: GrossWeight;
  measurementVolume: MeasurementVolume;
}

class LocationType {
  location: string;
  countryCode: string;
  portCode: string;
}

class Invoice {
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

class VinDetail {
  ladingBillNumber: string;
  vinNumber: string[];
}

export class RequestDoDto {
  requestType: number;
  requestDetail: {
    requestor: Requestor;
    shippingLine: ShippingLine;
    payment: string;
    document: Document;
    requestorId?: string;
    requestDoNumber?: string;
    doReleaseNo?: string;
    doReleaseDate?: string;
    doExpiredDate?: string;
    callSign?: string;
    terminalOp?: string;
  };
  parties: Parties;
  cargoDetail: {
    container?: Container[];
    nonContainer?: NonContainer[];
  };
  vinDetail?: VinDetail;
  location: {
    locationType: LocationType[];
  };
  paymentDetail: {
    invoice: Invoice[];
  };
  supportingDocument: {
    documentType: DocumentType[];
  };
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
  depoDetail: DepoDto;
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
