import { Head, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import { PelabuhanEntity } from './entities/pelabuhan.entity';

@Injectable()
export class PelabuhanService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string, keyword: string) {
    try {
      const keySearch = keyword.toUpperCase().trim();
      const { data } = await axios.get(
        `${this.configService.get(`API_REF_BASE_URL`)}/pelabuhan?page=1&search=${keySearch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result: PelabuhanEntity[] = data.data.map((item) => ({
        kode: item.KodePelabuhan,
        uraian: item.Pelabuhan,
        display: item.KodePelabuhan + ' | ' + item.Pelabuhan,
      }));
      return {
        data: result,
      };
    } catch (e) {
      validateError(e);
    }
  }
}
