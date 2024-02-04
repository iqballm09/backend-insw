import { Injectable } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { secret } from 'ref-secret';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class BankService {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}
  async findAll() {
    const { sub } = await this.authService.validateToken(secret.access_token);

    if (!sub) {
    }

    const { data } = await axios.get(
      `${this.configService.get('API_REF_BASE_URL')}/bank`,
      {
        headers: {
          Authorization: `Bearer ${secret.access_token}`,
        },
      },
    );
    return data;
  }
}
