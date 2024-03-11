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
    const workbook = XLSX.readFile(filepath);
    if (type === 'container') {
      const listObjCon = this.convertExcelToJSONContainer(workbook);
      return listObjCon;
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

    // delete file after upload
    await this.deleteFile(filename, type);
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

  convertExcelToJSONContainer(workbook: XLSX.WorkBook): any[] {
    const conHeaderFormat = [
      'no_container',
      'tipe_container',
      'uk_container',
      'gross_weight',
      'gross_weight_satuan',
      'ownership',
    ];
    const sealHeaderFormat = ['no_container', 'no_seal'];

    const conSheet = workbook.Sheets[workbook.SheetNames[0]];
    const conData = XLSX.utils.sheet_to_json(conSheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });
    const conHeader = conData[0];
    conData.shift();

    // check if container header is same with header format
    if (conHeader.toString() !== conHeaderFormat.toString()) {
      throw new BadRequestException(
        `Failed to generate JSON data, header ${conHeader} excel is not same with header format ${conHeaderFormat}`,
      );
    }

    const sealSheet = workbook.Sheets[workbook.SheetNames[1]];
    const sealData = XLSX.utils.sheet_to_json(sealSheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });
    const sealHeader = sealData[0];
    sealData.shift();

    if (sealHeader.toString() !== sealHeaderFormat.toString()) {
      throw new BadRequestException(
        `Failed to generate JSON data, header ${sealHeader} excel is not same with header format ${sealHeaderFormat}`,
      );
    }

    let cnt = 0;
    const listConObj = [];
    conData.forEach((data: any) => {
      if (!!data.join('').length) {
        const objData = {
          containerSeq: cnt++,
          containerNo: data[0].trim(),
          grossWeight: {
            amount: data[3],
            unit: data[4].split('-')[0].trim(),
          },
          sealNo: [
            ...new Set(
              sealData
                .filter((seal) => seal[0].trim() === data[0].trim())
                .map((seal) => seal[1].trim()),
            ),
          ],
          ownership: data[5].split('-')[0].trim(),
          sizeType: {
            kodeSize: data[1].trim(),
          },
        };
        listConObj.push(objData);
      }
    });
    return listConObj;
  }

  convertExcelToJSONCargo() {}
}
