import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
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
import { FileSizeValidationPipe } from 'src/helpers/pipes/file-size-validation.pipe';
import { FileTypeValidationPipe } from 'src/helpers/pipes/file-type-validation.pipe';

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
  // TODO: GET FILE

  @Post('upload?')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadFile(
    @Query('type') type: FolderType,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: 'pdf' }),
        ],
      }),
    )
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
