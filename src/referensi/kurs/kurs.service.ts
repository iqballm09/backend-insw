import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import { KursEntity } from './entities/kurs.entity';

@Injectable()
export class KursService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string) {
    try {
      const { data } = await axios.get(
        `${this.configService.get('API_REF_BASE_URL')}/kurs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result: KursEntity[] = data.data.map((item) => ({
        kode: item.kdKurs,
        uraian: item.mataUang,
        display: item.kdKurs + ' | ' + item.mataUang,
      }));
      return {
        data: result,
      };
    } catch (e) {
      validateError(e);
    }
  }
}
