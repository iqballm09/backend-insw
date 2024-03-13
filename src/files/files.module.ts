import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from './multer.options';
import { FilesService } from './files.service';
import { FlagService } from 'src/referensi/flag/flag.service';

@Module({
  providers: [UserService, AuthService, FilesService, FlagService],
  controllers: [FilesController],
  imports: [MulterModule.register(multerOptions)],
})
export class FilesModule {}
