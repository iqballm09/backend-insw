import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FolderType } from './folder.types';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { multerOptions } from './multer.options';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { Response } from 'express';

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
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: FolderType,
    @Req() req: any,
  ) {
    // Handle file upload logic
    if (!!!file) {
      throw new BadRequestException('File is required');
    }
    if (['container', 'cargo', 'vin'].includes(type)) {
      return this.fileService.uploadData(file.filename, type, req.token);
    }
    return {
      urlFile: `${process.env.API_URI}/files/${type}/${file.filename.split('.')[0]}`,
    };
  }

  @Get('download/:id')
  downloadPdf(@Param('id') id: string, @Res() res: Response) {
    return this.fileService.downloadPdf(+id, res);
  }

  @Get(':type/:name')
  // @UseGuards(AuthGuard)
  @ApiQuery({ name: 'type', enum: FolderType })
  // @ApiBearerAuth()
  showFile(
    @Param('name') name: string,
    @Param('type') type: FolderType,
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
