import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import { NegaraEntity } from './entities/negara.entity';

@Injectable()
export class NegaraService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string) {
    try {
      const { data } = await axios.get(
        `${this.configService.get('API_REF_BASE_URL')}/negara`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result: NegaraEntity[] = data.data.map((item) => ({
        kode: item.KodeNegara,
        uraian: item.Negara,
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
