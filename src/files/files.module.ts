import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';

@Module({
  providers: [],
  controllers: [FilesController],
})
export class FilesModule {}
