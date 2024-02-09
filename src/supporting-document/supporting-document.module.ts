import { Module } from '@nestjs/common';
import { SupportingDocumentService } from './supporting-document.service';
import { SupportingDocumentController } from './supporting-document.controller';

@Module({
  providers: [SupportingDocumentService],
  controllers: [SupportingDocumentController]
})
export class SupportingDocumentModule {}
