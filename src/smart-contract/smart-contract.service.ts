import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import {
  RequestDoDto,
  UpdateDoSLDto,
} from 'src/delivery-order/dto/create-do.dto';
import { StatusDo } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SmartContractService {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async enrollAdmin() {
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/user/enroll`,
        {
          id: 'admin',
          secret: 'adminpw',
        },
      );
      return {
        token: response.data.token,
      };
    } catch (e) {
      validateError(e);
    }
  }

  async enrollUser(userData: any, tokenAdmin: string) {
    // TODO: Registration account to Blockhain
    await this.createUser(userData, tokenAdmin);
    // get user token from smart contract
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/user/enroll`,
        {
          id: userData.name,
          secret: userData.hash,
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        },
      );
      return {
        token: response.data.token,
      };
    } catch (e) {
      validateError(e);
    }
  }

  async getAllUsers(tokenAdmin: string) {
    try {
      const response = await axios.get(
        `${this.configService.get('API_SMART_CONTRACT')}/user/identities`,
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        },
      );
      return {
        data: response.data.response.identities,
      };
    } catch (e) {
      validateError(e);
    }
  }

  async createUser(userData: any, tokenAdmin: string) {
    // check if user already exists
    const listUsers = (await this.getAllUsers(tokenAdmin)).data;
    for (const user of listUsers) {
      if (user.id === userData.name) {
        return;
      }
    }
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/user/register`,
        {
          id: userData.name,
          secret: userData.hash,
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        },
      );
      return response;
    } catch (e) {
      validateError(e);
    }
  }

  async requestDO(payload: RequestDoDto, statusDo: StatusDo) {
    // generate admin token
    const tokenAdmin = (await this.enrollAdmin()).token;
    // get user info
    const userData = await this.userService.getUserDB(
      payload.requestDetail.requestor.requestorId,
    );
    // generate user token
    const userToken = (await this.enrollUser(userData, tokenAdmin)).token;
    // send do to smart contract
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/invoke/do-channel/chaincode1`,
        {
          method: 'requestDO',
          args: [JSON.stringify(payload)],
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );
      return response.data;
    } catch (e) {
      validateError(e);
    }
  }

  async getDoDetailData(userId: string, orderId: string) {
    // generate admin token
    const tokenAdmin = (await this.enrollAdmin()).token;
    // get user info
    const userData = await this.userService.getUserDB(userId);
    // generate user token
    const userToken = (await this.enrollUser(userData, tokenAdmin)).token;
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/query/do-channel/chaincode1`,
        {
          method: 'queryOrderById',
          args: [orderId],
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );
      return response.data.response;
    } catch (e) {
      validateError(e);
    }
  }

  async getAllDoData() {
    // generate admin token
    const tokenAdmin = (await this.enrollAdmin()).token;
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/query/do-channel/chaincode1`,
        {
          method: 'queryAllOrders',
          args: [],
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        },
      );
      return { data: response.data.response };
    } catch (e) {
      validateError(e);
    }
  }

  async getAllDoCo(coName: string) {
    const tokenAdmin = (await this.enrollAdmin()).token;
    // get user info
    const userData = await this.userService.getUserDB(coName);
    // generate user token
    const userToken = (await this.enrollUser(userData, tokenAdmin)).token;
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/query/do-channel/chaincode1`,
        {
          method: 'queryAllOrdersCO',
          args: [coName],
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );
      return { data: response.data.response };
    } catch (e) {
      validateError(e);
    }
  }

  async getAllDoSL(slName: string, listKodeSL: string[]) {
    const tokenAdmin = (await this.enrollAdmin()).token;
    // get user info
    const userData = await this.userService.getUserDB(slName);
    // generate user token
    const userToken = (await this.enrollUser(userData, tokenAdmin)).token;
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/query/do-channel/chaincode1`,
        {
          method: 'queryAllOrdersSL',
          args: [JSON.stringify(listKodeSL)],
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );
      return { data: response.data.response };
    } catch (e) {
      validateError(e);
    }
  }

  async updateStatusDo(username: string, orderId: string, status: string, note: string) {
    const tokenAdmin = (await this.enrollAdmin()).token;
    const userData = await this.userService.getUserDB(username);
    // generate user token
    const userToken = (await this.enrollUser(userData, tokenAdmin)).token;
    const response = await axios.post(
      `${this.configService.get('API_SMART_CONTRACT')}/invoke/do-channel/chaincode1`,
      {
        method: 'updateStatusDO',
        args: [orderId, status, note],
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
    );
    return response.data.response;
  }

  async updateDoSL(
    slName: string,
    orderId: string,
    payload: UpdateDoSLDto,
    status: StatusDo,
  ) {
    const tokenAdmin = (await this.enrollAdmin()).token;
    const userData = await this.userService.getUserDB(slName);

    // get do data
    const data = await this.getDoDetailData(slName, orderId);

    // update data
    data.requestDetail.shippingLine.vesselName = payload.vesselName;
    data.requestDetail.shippingLine.voyageNumber = payload.voyageNo;
    data.requestDetail.doReleaseDate = payload.doReleaseDate;
    data.requestDetail.doExpiredDate = payload.doExpiredDate;
    data.requestDetail.doReleaseNumber = payload.doReleaseNo;
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

    // generate user token
    const userToken = (await this.enrollUser(userData, tokenAdmin)).token;
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/invoke/do-channel/chaincode1`,
        {
          method: 'updateDO',
          args: [orderId, JSON.stringify(data)],
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );
      return response.data.response;
    } catch (e) {
      validateError(e);
    }
  }

  async updateDoCo(
    coName: string,
    orderId: string,
    payload: RequestDoDto,
    status: StatusDo,
    statusNote: string,
  ) {
    const tokenAdmin = (await this.enrollAdmin()).token;
    const userData = await this.userService.getUserDB(coName);

    // update status
    payload.status = status;
    payload.statusDate = String(new Date());
    payload.orderId = orderId;
    payload.statusNote = statusNote;

    // generate user token
    const userToken = (await this.enrollUser(userData, tokenAdmin)).token;
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/invoke/do-channel/chaincode1`,
        {
          method: 'updateDO',
          args: [orderId, JSON.stringify(payload)],
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );
      return response.data.response;
    } catch (e) {
      validateError(e);
    }
  }

  async deleteDo(orderId: string) {
    const tokenAdmin = (await this.enrollAdmin()).token;
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/invoke/do-channel/chaincode1`,
        {
          method: 'deleteDO',
          args: [orderId],
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        },
      );
      return response.data.response;
    } catch (e) {
      validateError(e);
    }
  }

  async getStatusDo(orderId: string) {
    const tokenAdmin = (await this.enrollAdmin()).token;
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/query/do-channel/chaincode1`,
        {
          method: 'getStatusDO',
          args: [orderId],
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        },
      );
      return response.data.response;
    } catch (e) {
      validateError(e);
    }
  }
}
