import { Injectable } from '@nestjs/common';
import { validateError } from 'src/util';
import * as fs from 'fs';
import { SupportingDocumentEntity } from './entities/supporting-document.entity';

@Injectable()
export class SupportingDocumentService {
  async findAll(token: string) {
    try {
      const data = JSON.parse(
        fs.readFileSync(
          './src/referensi/supporting-document/data.json',
          'utf-8',
        ),
      );
      const result: SupportingDocumentEntity[] = data.data.map((item) => ({
        kode: item.id_dokumen,
        uraian: item.uraian_dokumen,
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
