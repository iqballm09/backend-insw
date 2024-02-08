import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import { KabkotaEntity } from './entities/kabkota.entity';

@Injectable()
export class KabkotaService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string) {
    try {
      const { data } = await axios.get(
        `${this.configService.get('API_REF_BASE_URL')}/daerah/search/all?keyword=&daerah_tipe=2`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result: KabkotaEntity[] = data.data.map((item) => ({
        kode: item.KodeDaerah,
        uraian: item.NamaDaerah,
        display: item.DaerahAsal,
      }));
      return result;
    } catch (e) {
      validateError(e);
    }
  }
}
