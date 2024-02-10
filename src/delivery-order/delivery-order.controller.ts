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
import { ContainerRequestDO, NonContainerRequestDO } from './dto/create-do.dto';
import { StatusDo } from '@prisma/client';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Delivery Order')
@Controller('do')
export class DeliveryOrderController {
  constructor(private readonly deliveryOrderService: DeliveryOrderService) {}

  @Post('kontainer')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: ContainerRequestDO,
  })
  createDoKontainer(@Body() payload: ContainerRequestDO, @Req() req: any) {
    return this.deliveryOrderService.createKontainer(
      payload.request,
      req.token,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getAllDo(@Req() req: any) {
    return this.deliveryOrderService.getAllDo(req.token);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getDoDetail(@Param('id') id: string) {
    return this.deliveryOrderService.getDoDetail(+id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  deleteModel(@Param('id') id: string) {
    return this.deliveryOrderService.deleteDo(+id);
  }

  @Post('non-kontainer')
  @UseGuards(AuthGuard)
  @ApiBody({
    type: NonContainerRequestDO,
  })
  @ApiBearerAuth()
  createDoNonKontainer(
    @Body() payload: NonContainerRequestDO,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.createNonKontainer(
      payload.request,
      req.token,
    );
  }
}
