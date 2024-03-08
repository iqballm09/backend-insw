import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { buildOpenIdClient } from 'src/auth/strategy/oidc.strategy';
import { validateError } from 'src/util';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { FolderType } from './folder.types';
import axios from 'axios';

@Injectable()
export class FilesService {
  async show(res: any, name: string, type: string) {
    try {
      const client = await buildOpenIdClient();
      res.sendFile(`${name}.pdf`, {
        root: `assets/upload/${client.client_id}/${type}`,
      });
    } catch (e) {
      validateError(e);
    }
  }

  async uploadData(filename: string, type: FolderType) {
    const client = await buildOpenIdClient();
    const filepath = `assets/upload/${client.client_id}/${type}/${filename}`;
    if (type === 'container') {
      const headerFormat = [
        'no_container',
        'tipe_container',
        'uk_container',
        'gross_weight',
        'gross_weight_satuan',
        'ownership',
      ];
      const workbook = XLSX.readFile(filepath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
      });
      const header = jsonData[0];
      // check if header is same with header format
      if (header.toString() !== headerFormat.toString()) {
        throw new BadRequestException(
          `Failed to generate JSON data, header ${header} excel is not same with header format ${headerFormat}`,
        );
      }
      jsonData.shift();
      for (const row of jsonData) {
        console.log(row);
      }
    } else if (type === 'cargo') {
      const headerFormat = [
        'goods_desc',
        'package_qty',
        'package_uom',
        'gross_qty',
        'gross_uom',
        'measurement_qty',
        'measurement_uom',
      ];
      const header = '';
    }
  }

  async deleteFile(name: string, type: string): Promise<void> {
    const client = await buildOpenIdClient();
    const filepath = `./assets/upload/${client.client_id}/${type}/${name}.pdf`;

    return new Promise(async (resolve, reject) => {
      fs.access(filepath, fs.constants.F_OK, (accessError) => {
        if (accessError) {
          const notFoundError = new Error(`File not found!`);
          reject({ error: notFoundError.message, code: HttpStatus.NOT_FOUND });
        } else {
          fs.unlink(filepath, (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  convertExcelToJSON() {}
}
