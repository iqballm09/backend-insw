import {
  BadRequestException,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FolderType } from './folder.types';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { multerOptions } from './multer.options';
import { buildOpenIdClient } from 'src/auth/strategy/oidc.strategy';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { validateError } from 'src/util';

@Controller('files')
@ApiTags('Files')
export class FilesController {
  constructor(private fileService: FilesService) {}

  @Post('upload?')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiQuery({ name: 'type', enum: FolderType })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadFile(
    @Query('type') type: FolderType,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: 'pdf' }),
        ],
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
    return { urlFile: `${process.env.HOST}/file/${type}/${file.filename}` };
  }

  @Get(':type/:filename')
  async serveFile(
    @Param('filename') filename: string,
    @Param('type') type: FolderType,
    @Res() res: Response,
  ) {
    res.sendFile(filename, { root: 'uploads/' + type });
  }

  @Get(':name?')
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'type', enum: FolderType })
  @ApiBearerAuth()
  showFile(
    @Param('name') name: string,
    @Query('type') type: FolderType,
    @Res() res,
  ) {
    return this.fileService.show(res, name, type);
  }

  @Delete(':name')
  @ApiQuery({ name: 'type', enum: FolderType })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async deleteFile(
    @Param('name') name: string,
    @Query('type') type: FolderType,
  ): Promise<any> {
    try {
      await this.fileService.deleteFile(name, type);
      return {
        code: HttpStatus.OK,
        message: 'File has been deleted!',
      };
    } catch (err) {
      throw new HttpException(
        {
          code: err.code || HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed',
          error: err.error,
        },
        err.code || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
