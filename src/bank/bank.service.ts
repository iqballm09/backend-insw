import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { secret } from 'ref-secret';
import { AuthService } from 'src/auth/auth.service';
import { validateError } from 'src/util';

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
      return data;
    } catch (e) {
      validateError(e);
    }
  }
}
