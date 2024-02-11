import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { buildOpenIdClient } from 'src/auth/strategy/oidc.strategy';
import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
  storage: diskStorage({
    destination: async (req, file, callback) => {
      const type = req.query.type;
      // get client info
      const client = await buildOpenIdClient();
      const dirpath = `./assets/upload/${client.client_id}/${type}`;
      // check directory exist
      if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath, { recursive: true });
      }
      callback(null, dirpath);
    },
    filename: (req, file, callback) => {
      // CHECK if FILE HAS BEEN UPLOADED
      if (!!!file) {
        throw new BadRequestException('File required');
      }
      const name = file.originalname.split('.')[0];
      const extension = extname(file.originalname);
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      callback(null, `${randomName}${extension}`);
    },
  }),
};
