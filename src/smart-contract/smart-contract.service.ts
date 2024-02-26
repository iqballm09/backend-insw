import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateActorDto } from './dto/create-actor.dto';
import axios from 'axios';
import { validateError } from 'src/util';
import { stringify } from 'flatted';

@Injectable()
export class SmartContractService {
  constructor(private configService: ConfigService) {}

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

  async getAllActors() {
    // generate admin token
    const tokenAdmin = (await this.enrollAdmin()).token;
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

  async createActor(payload: CreateActorDto) {
    // generate admin token
    const tokenAdmin = (await this.enrollAdmin()).token;

    // check if actor already exists
    const listActors = (await this.getAllActors()).data.map(
      (actor) => actor.id,
    );

    if (listActors.includes(payload.Id)) {
      throw new BadRequestException(
        `Actor by Id = ${payload.Id} already exists!`,
      );
    }

    try {
      const response = await axios.post(
        `${this.configService.get('API_SMART_CONTRACT')}/user/register`,
        {
          id: payload.Id,
          secret: payload.Secret,
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        },
      );

      return {
        message: response.data.message,
      };
    } catch (e) {
      validateError(e);
    }
  }
}
