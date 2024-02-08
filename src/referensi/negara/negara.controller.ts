import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NegaraService } from './negara.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('negara')
@ApiTags('Data Referensi')
export class NegaraController {
  constructor(private readonly negaraService: NegaraService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.negaraService.findAll(req.token);
  }
}
