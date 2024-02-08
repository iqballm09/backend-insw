import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import { BankEntity } from './entities/bank.entity';

@Injectable()
export class BankService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string) {
    try {
      const { data } = await axios.get(
        `${this.configService.get('API_REF_BASE_URL')}/bank`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result: BankEntity[] = data.data.map((item) => ({
        kode: item.kodeBank,
        uraian: item.uraianBank,
        display: item.kodeBank + ' | ' + item.uraianBank,
      }));
      return {
        data: result,
      };
    } catch (e) {
      validateError(e);
    }
  }
}
