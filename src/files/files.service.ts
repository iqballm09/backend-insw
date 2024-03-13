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
import { FlagService } from 'src/referensi/flag/flag.service';

@Injectable()
export class FilesService {
  constructor(private flagService: FlagService) {}
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

  async uploadData(filename: string, type: FolderType, token: string) {
    const client = await buildOpenIdClient();
    const filepath = `assets/upload/${client.client_id}/${type}/${filename}`;
    const workbook = XLSX.readFile(filepath);
    if (type === 'container') {
      const listObjCon = await this.convertExcelToJSONContainer(workbook);
      return listObjCon;
    } else if (type === 'cargo') {
      const listObjCargo = await this.convertExcelToJSONCargo(workbook, token);
      return listObjCargo;
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

  convertExcelToJSONContainer(workbook: XLSX.WorkBook) {
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

  async convertExcelToJSONCargo(workbook: XLSX.WorkBook, token: string) {
    const headerFormat = [
      'goods_desc',
      'package_qty',
      'package_uom',
      'gross_qty',
      'gross_uom',
      'measurement_qty',
      'measurement_uom',
    ];
    // check if header same
    const cargoSheet = workbook.Sheets[workbook.SheetNames[0]];
    const cargoData = XLSX.utils.sheet_to_json(cargoSheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });
    const cargoHeader = cargoData[0];
    cargoData.shift();

    // check if the header is same with header format
    if (cargoHeader.toString() !== headerFormat.toString()) {
      throw new BadRequestException(
        `Failed to generate JSON data, header ${cargoHeader} is not same as header format ${headerFormat}`,
      );
    }

    let cnt = 0;
    const listCargoObj = [];
    const listMeasurement = await this.getListSatuan(token, 'measurement_uom');
    const listGwu = await this.getListSatuan(token, 'weight_uom');
    const listPackage = await this.getListSatuan(token, 'package_uom');

    cargoData.forEach((data: any) => {
      if (!!data.join('').length) {
        const satuanGwu = data[4].split('-')[0].trim().toUpperCase();
        const satuanMeasurement = data[6].trim().toUpperCase();
        const satuanPackage = data[2].trim();
        if (!listGwu.includes(satuanGwu)) {
          throw new BadRequestException(
            `Satuan ${satuanGwu} is not exist on list gross weight unit '${listGwu}'`,
          );
        }
        if (!listPackage.includes(satuanPackage)) {
          throw new BadRequestException(
            `Satuan ${satuanPackage} is not exist on list package unit '${listPackage}'`,
          );
        }
        if (!listMeasurement.includes(satuanMeasurement)) {
          throw new BadRequestException(
            `Satuan ${satuanMeasurement} is not exist on list measurement unit '${listMeasurement}'`,
          );
        }
        const objData = {
          nonContainerSeq: cnt++,
          grossWeight: {
            amount: data[3],
            unit: data[4].split('-')[0].trim().toUpperCase(),
          },
          measurementVolume: {
            amount: data[5],
            unit: data[6].trim().toUpperCase(),
          },
          packageQuantity: {
            amount: data[1],
            unit: data[2].trim(),
          },
          goodsDescription: data[0].trim(),
        };
        listCargoObj.push(objData);
      }
    });
    return listCargoObj;
  }

  convertExcelToJSONVin() {}

  async getListSatuan(token: string, keyword: string) {
    // get data reference
    const refData = await this.flagService.findAll(token, keyword);
    return refData.data.map((item) => item.kode);
  }
}
