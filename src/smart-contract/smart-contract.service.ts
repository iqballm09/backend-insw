import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-actor.dto';
import axios from 'axios';
import { validateError } from 'src/util';
import { RequestDoDto } from 'src/delivery-order/dto/create-do.dto';
import { StatusDo } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SmartContractService {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
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

  async createUser(userData: any) {
    // generate admin token
    const tokenAdmin = (await this.enrollAdmin()).token;
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
    const userData = await this.authService.getUserDB(
      payload.requestDetail.requestorId,
    );
    // generate user token
    const userToken = (await this.enrollUser(userData, tokenAdmin)).token;
    // send do to smart contract
    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/invoke/do-channel/chaincode1`,
        {
          method: 'request',
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
    const userData = await this.authService.getUserDB(userId);
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
    const userData = await this.authService.getUserDB(coName);
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
}
