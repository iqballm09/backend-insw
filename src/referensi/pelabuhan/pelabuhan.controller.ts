import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PelabuhanService } from './pelabuhan.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('pelabuhan')
export class PelabuhanController {
  constructor(private readonly pelabuhanService: PelabuhanService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any, @Query('keyword') keyword: string) {
    return this.pelabuhanService.findAll(req.token, keyword);
  }
}
