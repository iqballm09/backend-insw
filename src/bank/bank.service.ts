import { Injectable } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class BankService {
  constructor(private configService: ConfigService) {}
  async findAll() {
    const { data } = await axios.get(
      `${this.configService.get('API_REF_BASE_URL')}/bank`,
      {
        headers: {
          Authorization: `Bearer ${`7RSqd5-NNFcFYCNCzgWa6YauN517egtq4Fie2subGGq`}`,
        },
      },
    );
    return data;
  }
}
