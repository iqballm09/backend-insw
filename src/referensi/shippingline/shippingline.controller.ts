import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ShippinglineService } from './shippingline.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('shippingline/search')
@ApiTags('Data Referensi')
export class ShippinglineController {
  constructor(private readonly shippinglineService: ShippinglineService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findSpecific(@Req() req: any, @Query('keyword') keyword: string) {
    return this.shippinglineService.findSpecific(req.token, keyword);
  }

  @Get('all')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findAll(@Req() req: any) {
    return this.shippinglineService.findAll(req.token);
  }
}
