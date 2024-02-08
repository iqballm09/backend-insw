import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PelabuhanService } from './pelabuhan.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('pelabuhan')
@ApiTags('Data Referensi')
export class PelabuhanController {
  constructor(private readonly pelabuhanService: PelabuhanService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any, @Query('keyword') keyword: string) {
    return this.pelabuhanService.findAll(req.token, keyword);
  }
}
