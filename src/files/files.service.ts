import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { buildOpenIdClient } from 'src/auth/strategy/oidc.strategy';
import { validateError } from 'src/util';
import * as fs from 'fs';
import * as path from 'path';
import { NotFoundError } from 'rxjs';

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
}
