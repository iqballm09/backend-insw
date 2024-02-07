import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { KursService } from './kurs.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('kurs')
export class KursController {
  constructor(private readonly kursService: KursService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.kursService.findAll(req.token);
  }
}
