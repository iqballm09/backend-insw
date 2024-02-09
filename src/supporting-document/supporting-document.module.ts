import { Module } from '@nestjs/common';
import { SupportingDocumentService } from './supporting-document.service';
import { SupportingDocumentController } from './supporting-document.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [SupportingDocumentService, AuthService, UserService],
  controllers: [SupportingDocumentController],
})
export class SupportingDocumentModule {}
