import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import { ShippinglineEntity } from './entities/shippingline.entity';

@Injectable()
export class ShippinglineService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string) {
    try {
      const { data } = await axios.get(
        `${this.configService.get('API_REF_BASE_URL')}/shipping-line/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result: ShippinglineEntity[] = data.data.map((item) => ({
        kode: item.kode,
        uraian: item.uraian,
        display: item.display,
        kd_detail_ga: item.kd_detail_ga,
      }));
      return {
        data: result,
      };
    } catch (e) {
      validateError(e);
    }
  }
}
