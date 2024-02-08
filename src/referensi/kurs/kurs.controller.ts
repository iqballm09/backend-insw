import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { KursService } from './kurs.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('kurs')
@ApiTags('Data Referensi')
export class KursController {
  constructor(private readonly kursService: KursService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.kursService.findAll(req.token);
  }
}
