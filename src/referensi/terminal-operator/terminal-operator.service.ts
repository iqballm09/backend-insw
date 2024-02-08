import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { validateError } from 'src/util';
import { TerminalOperatorEntity } from './entities/terminal-operator.entity';

@Injectable()
export class TerminalOperatorService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string) {
    try {
      const { data } = await axios.get(
        `${this.configService.get('API_REF_BASE_URL')}/terminal-operator/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result: TerminalOperatorEntity[] = data.data.map((item) => ({
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
