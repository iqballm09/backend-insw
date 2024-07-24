import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import {
  RequestDoDto,
  UpdateDoSLDto,
} from 'src/delivery-order/dto/create-do.dto';
import { StatusDo } from '@prisma/client';

@Injectable()
export class SmartContractService {
  constructor(private configService: ConfigService) {}

  async requestDO(payload: RequestDoDto) {
    // send do to smart contract
    try {
      const response = await axios.post(
        `${this.configService.get('API_SC_CO')}/chaincode/invoke/do`,
        {
          data: JSON.stringify(payload),
        },
      );
      return response.data;
    } catch (e) {
      validateError(e);
    }
  }

  async getDoDetailData(orderId: string) {
    try {
      const response = await axios.get(
        `${this.configService.get('API_SC_LNSW')}/chaincode/query/do/${orderId}`,
      );
      return response.data;
    } catch (e) {
      validateError(e);
    }
  }

  async getAllDoData() {
    try {
      const response = await axios.get(
        `${this.configService.get('API_SC_LNSW')}/chaincode/query/do`,
      );
      return { data: response.data };
    } catch (e) {
      validateError(e);
    }
  }

  async getAllDoCo(coName: string) {
    try {
      const response = await axios.post(
        `${this.configService.get('API_SC_CO')}/chaincode/query/do/co`,
        {
          orgName: coName,
        },
      );
      return { data: response.data };
    } catch (e) {
      validateError(e);
    }
  }

  async getAllDoSL(listKodeSL: string[]) {
    try {
      const response = await axios.post(
        `${this.configService.get('API_SC_SL')}/chaincode/query/do/sl`,
        {
          orgName: JSON.stringify(listKodeSL),
        },
      );
      return { data: response.data };
    } catch (e) {
      validateError(e);
    }
  }

  async updateStatusDoCo(orderId: string, status: string, note: string) {
    const response = await axios.put(
      `${this.configService.get('API_SC_CO')}/chaincode/invoke/status-do/co/${orderId}`,
      {
        status: status,
        note: note,
      },
    );
    return response.data;
  }

  async updateStatusDoSl(orderId: string, status: string, note: string) {
    const response = await axios.put(
      `${this.configService.get('API_SC_SL')}/chaincode/invoke/status-do/sl/${orderId}`,
      {
        status: status,
        note: note,
      },
    );
    return response.data;
  }

  async updateDoSL(orderId: string, payload: UpdateDoSLDto, status: StatusDo) {
    // get do data
    const data = await this.getDoDetailData(orderId);

    // update data
    data.requestDetail.shippingLine.vesselName = payload.vesselName;
    data.requestDetail.shippingLine.voyageNumber = payload.voyageNo;
    data.requestDetail.doReleaseDate = payload.doReleaseDate;
    data.requestDetail.doExpiredDate = payload.doExpiredDate;
    data.requestDetail.doReleaseNo = payload.doReleaseNo;
    data.requestDetail.callSign = payload.callSign;
    data.requestDetail.terminalOp = payload.terminalOp;

    if (+data.requestType === 1) {
      for (let i = 0; i < data.cargoDetail.container.length; i++) {
        data.cargoDetail.container[i].containerNo =
          payload.cargoDetail[i].containerNo;
        data.cargoDetail.container[i].sizeType =
          payload.cargoDetail[i].sizeType;
        data.cargoDetail.container[i].depoDetail =
          payload.cargoDetail[i].depoDetail;
      }
    }

    // update status
    data.status = status;
    data.statusDate = String(new Date());
    data.statusNote = payload.statusNote;

    try {
      const response = await axios.put(
        `${this.configService.get('API_SC_SL')}/chaincode/invoke/do/sl/${orderId}`,
        {
          data: JSON.stringify(data),
        },
      );
      return response.data;
    } catch (e) {
      validateError(e);
    }
  }

  async updateDoCo(
    orderId: string,
    payload: RequestDoDto,
    status: StatusDo,
    statusNote: string,
  ) {
    // update status
    payload.status = status;
    payload.statusDate = String(new Date());
    payload.orderId = orderId;
    payload.statusNote = statusNote;

    try {
      const response = await axios.put(
        `${this.configService.get('API_SC_CO')}/chaincode/invoke/do/co/${orderId}`,
        {
          data: JSON.stringify(payload),
        },
      );
      return response.data;
    } catch (e) {
      validateError(e);
    }
  }

  async getStatusDo(orderId: string) {
    try {
      const response = await axios.get(
        `${this.configService.get('API_SC_LNSW')}/chaincode/query/status-do/${orderId}`,
      );
      return response.data;
    } catch (e) {
      validateError(e);
    }
  }
}
