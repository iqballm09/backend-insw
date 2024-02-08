import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { KabkotaService } from './kabkota.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('kabkota')
@ApiTags('Data Referensi')
export class KabkotaController {
  constructor(private readonly kabkotaService: KabkotaService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.kabkotaService.findAll(req.token);
  }
}
