import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import { FlagEntity } from './entities/flag.entity';

@Injectable()
export class FlagService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string, keyword: string) {
    try {
      const { data } = await axios.get(
        `${this.configService.get('API_REF_BASE_URL')}/flag/doSp/getByFlagJenis?keyword=${keyword}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result: FlagEntity[] = data.data.map((item) => ({
        kode: item.kode,
        uraian: item.uraian,
        display: item.display,
      }));
      return {
        data: result,
      };
    } catch (e) {
      validateError(e);
    }
  }
}
