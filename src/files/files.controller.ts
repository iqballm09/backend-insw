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
