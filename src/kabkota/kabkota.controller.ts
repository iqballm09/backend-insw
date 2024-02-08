import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { KabkotaService } from './kabkota.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('kabkota')
export class KabkotaController {
  constructor(private readonly kabkotaService: KabkotaService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.kabkotaService.findAll(req.token);
  }
}
