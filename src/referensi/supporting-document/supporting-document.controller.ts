import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SupportingDocumentService } from './supporting-document.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('supporting-document')
@ApiTags('Data Referensi')
export class SupportingDocumentController {
  constructor(private readonly documentService: SupportingDocumentService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.documentService.findAll(req.token);
  }
}
