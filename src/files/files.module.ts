import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from './multer.options';
import { FilesService } from './files.service';

@Module({
  providers: [UserService, AuthService, FilesService],
  controllers: [FilesController],
  imports: [MulterModule.register(multerOptions)],
})
export class FilesModule {}
