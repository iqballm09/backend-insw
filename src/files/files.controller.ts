import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { FolderType } from './folder.types';
import { FileSizeValidationPipe } from 'src/helpers/pipes/file-size-validation.pipe';
import { FileTypeValidationPipe } from 'src/helpers/pipes/file-type-validation.pipe';
import { Response } from 'express';
import * as fs from 'fs';

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

@Controller('file')
export class FilesController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folderType = req.query.type; // Get folder type from query params
          const uploadPath = `./uploads/${folderType}`;
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Create the folderType if it doesn't exist
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          return cb(
            new BadRequestException('File size must be less than 10MB'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: FolderType,
  ) {
    // Handle file upload logic
    return { urlFile: `${process.env.DEV_HOST}/file/${type}/${file.filename}` };
  }

  @Get(':type/:filename')
  async serveFile(
    @Param('filename') filename: string,
    @Param('type') type: FolderType,
    @Res() res: Response,
  ) {
    res.sendFile(filename, { root: 'uploads/' + type });
  }
}
