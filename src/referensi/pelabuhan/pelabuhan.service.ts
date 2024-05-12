import { Head, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import { PelabuhanEntity } from './entities/pelabuhan.entity';

@Injectable()
export class PelabuhanService {
  constructor(private configService: ConfigService) {}

  async findAllIndo(token: string) {
    try {
      const { data } = await axios.get(
        `${this.configService.get(`API_REF_BASE_URL`)}/pelabuhan?page=1&search=a`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // get total page
      const total_page = data.data.total_page;
      // for (let i = 1; i <= total_page; i++) {
      //   const { data } = await axios.get(
      //     `${this.configService.get(`API_REF_BASE_URL`)}/pelabuhan?page=${i}&search=a`,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${token}`,
      //       },
      //     },
      //   );
      //   if (data.data.result.Negara === 'INDONESIA') {
      //     result.push({
      //       kode: item.KodePelabuhan,
      //       uraian: item.Pelabuhan,
      //       display: item.KodePelabuhan + ' | ' + item.Pelabuhan,
      //     })
      //   }
      // }
      const result: PelabuhanEntity[] = data.data.result.map((item) => ({
        kode: item.KodePelabuhan,
        uraian: item.Pelabuhan,
        display: item.KodePelabuhan + ' | ' + item.Pelabuhan,
      }));
      return {
        data: data.data,
      };
    } catch (e) {
      validateError(e);
    }
  }

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
      const result: PelabuhanEntity[] = data.data.result.map((item) => ({
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
