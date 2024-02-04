import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { RequestDO, RequestDoDto } from './dto/create-do.dto';

@Controller('do')
export class DeliveryOrderController {
  constructor(private readonly deliveryOrderService: DeliveryOrderService) {}

  @Post('kontainer')
  createDoKontainer(@Body() payload: RequestDO) {
    return this.deliveryOrderService.createKontainer(payload.request);
  }

  @Get()
  getAllDo() {
    return this.deliveryOrderService.getAllDo();
  }

  @Get(':id')
  getDoDetail(@Param('id') id: string) {
    return this.deliveryOrderService.getDoDetail(+id);
  }

  // @Post('non-kontainer')
  // createDoNonKontainer(@Body() payload: RequestDO) {
  //   return this.deliveryOrderService.createNonKontainer();
  // }
}
