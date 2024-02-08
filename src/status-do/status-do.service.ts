import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import { StatusDoEntity } from './entities/status-do.entity';

@Injectable()
export class StatusDoService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string) {
    try {
      const { data } = await axios.get(
        `${this.configService.get('API_REF_BASE_URL')}/status/getAll`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result: StatusDoEntity[] = data.data
        .filter(
          (item) => item.id_tab_status === 'D4' && item.kode_proses[0] <= '2',
        )
        .map((item) => ({
          kode: item.kode_proses,
          uraian: item.ur_proses,
        }))
        .sort((a, b) => a.kode - b.kode);
      return {
        data: result,
      };
    } catch (e) {
      validateError(e);
    }
  }
}
