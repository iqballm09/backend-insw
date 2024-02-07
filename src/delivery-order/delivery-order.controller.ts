import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { RequestDO, RequestDoDto } from './dto/create-do.dto';
import { StatusDo } from '@prisma/client';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('do')
export class DeliveryOrderController {
  constructor(private readonly deliveryOrderService: DeliveryOrderService) {}

  @Post('kontainer')
  @UseGuards(AuthGuard)
  createDoKontainer(@Body() payload: RequestDO, @Req() req: any) {
    return this.deliveryOrderService.createKontainer(
      payload.request,
      req.token,
    );
  }

  @Get()
  getAllDo() {
    return this.deliveryOrderService.getAllDo();
  }

  @Get(':id')
  getDoDetail(@Param('id') id: string) {
    return this.deliveryOrderService.getDoDetail(+id);
  }

  @Delete(':id')
  deleteModel(@Param('id') id: string) {
    return this.deliveryOrderService.deleteDo(+id);
  }

  @Post('non-kontainer')
  @UseGuards(AuthGuard)
  createDoNonKontainer(@Body() payload: RequestDO, @Req() req: any) {
    return this.deliveryOrderService.createNonKontainer(
      payload.request,
      req.token,
    );
  }
}
