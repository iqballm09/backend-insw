import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FolderType } from './folder.types';

const storage = diskStorage({
  destination: (req, file, callback) => {
    const type = req.query.type;
    const path = `./assets/upload/${type}`;
    callback(null, path);
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const extension = extname(file.originalname);
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    callback(null, `${randomName}${extension}`);
  },
});

@Controller('files')
export class FilesController {
  @Post('upload?')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadFile(
    @Query('type') type: FolderType,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const path = `${file.destination}`.slice(1);
    // console.log(path);
    const response = {
      originalName: file.originalname,
      mimetype: file.mimetype,
      path: `${process.env.DEV_HOST}${path}/${file.filename}`,
    };
    return { data: response };
  }
}
