import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NegaraService } from './negara.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('negara')
export class NegaraController {
  constructor(private readonly negaraService: NegaraService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.negaraService.findAll(req.token);
  }
}
