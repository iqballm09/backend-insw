import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateError } from 'src/util';
const data = require('./data.json');

@Injectable()
export class SupportingDocumentService {
  constructor(private configService: ConfigService) {}

  async findAll(token: string) {
    try {
      console.log(data);
    } catch (e) {
      validateError(e);
    }
  }
}
