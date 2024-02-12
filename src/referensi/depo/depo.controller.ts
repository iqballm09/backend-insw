import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DepoService } from './depo.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('depo')
@ApiTags('Data Referensi')
export class DepoController {
  constructor(private depoService: DepoService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findAll(@Req() req: any) {
    return this.depoService.getAllDepo(req.token);
  }
}
