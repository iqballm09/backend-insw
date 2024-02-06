interface Requestor {
  requestorType: string;
  urlFile: string;
  npwp: string;
  nib: string;
  requestorName: string;
  requestorAddress: string;
}

interface ShippingLine {
  shippingType: string;
  doExpired: string;
  vesselName: string;
  voyageNumber: string;
}

interface Document {
  ladingBillNumber: string;
  ladingBillDate: string;
  ladingBillType: string;
  urlFile: string;
}

interface Parties {
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

interface SizeType {
  size: number;
  type: string;
}

interface GrossWeight {
  amount: number;
  unit: string;
}

interface PackageQuantity {
  amount: number;
  unit: string;
}

interface MeasurementVolume {
  amount: number;
  unit: string;
}

interface Container {
  containerSeq: number;
  containerNo: string;
  sealNo: string[];
  sizeType: SizeType;
  grossWeight: GrossWeight;
  ownership: string;
}

interface NonContainer {
  nonContainerSeq: number;
  goodsDescription: string;
  packageQuantity: PackageQuantity;
  grossWeight: GrossWeight;
  measurementVolume: MeasurementVolume;
}

interface LocationType {
  location: string;
  countryCode: string;
  portCode: string;
}

interface Invoice {
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
  bankId: string;
  accountNo: string;
  urlFile: string;
}

interface DocumentType {
  document: string;
  documentNo: string;
  documentDate: string;
  urlFile: string;
}

export interface RequestDoDto {
  requestType: number;
  requestDetail: {
    requestor: Requestor;
    shippingLine: ShippingLine;
    payment: string;
    document: Document;
  };
  parties: Parties;
  cargoDetail: {
    container?: Container[];
    nonContainer?: NonContainer[];
    vinNumber?: string[];
  };
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

export interface RequestDO {
  request: RequestDoDto;
}
