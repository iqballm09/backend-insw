import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';

@Injectable()
export class SizeTypecodeService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string) {
    try {
      const { data } = await axios.get(
        `${this.configService.get('API_REF_BASE_URL')}/size-typecode/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return {
        data: data.data,
      };
    } catch (e) {
      validateError(e);
    }
  }
}
