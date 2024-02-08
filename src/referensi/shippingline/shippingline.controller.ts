import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ShippinglineService } from './shippingline.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('shippingline')
export class ShippinglineController {
  constructor(private readonly shippinglineService: ShippinglineService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.shippinglineService.findAll(req.token);
  }
}
