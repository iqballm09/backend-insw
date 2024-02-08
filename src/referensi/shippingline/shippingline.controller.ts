import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ShippinglineService } from './shippingline.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('shippingline')
@ApiTags('Data Referensi')
export class ShippinglineController {
  constructor(private readonly shippinglineService: ShippinglineService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findAll(@Req() req: any) {
    return this.shippinglineService.findAll(req.token);
  }
}
