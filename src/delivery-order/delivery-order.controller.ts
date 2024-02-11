import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnsupportedMediaTypeException,
  UseGuards,
} from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { StatusDo } from '@prisma/client';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import {
  CreateContainerRequestDO,
  CreateNonContainerRequestDO,
  UpdateCargoDetailSL,
  UpdateContainerRequestDO,
  UpdateDoSLDto,
  UpdateNonContainerRequestDO,
} from './dto/create-do.dto';

@ApiTags('Delivery Order')
@Controller('do')
export class DeliveryOrderController {
  constructor(private readonly deliveryOrderService: DeliveryOrderService) {}

  @Post('kontainer')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: CreateContainerRequestDO,
  })
  createDoKontainer(
    @Body() payload: CreateContainerRequestDO,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.createKontainer(
      payload.request,
      req.token,
    );
  }

  @Put('kontainer/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateContainerRequestDO,
  })
  updateDoKontainer(
    @Param('id') id: number,
    @Body() payload: UpdateContainerRequestDO,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.updateKontainer(
      +id,
      payload.request,
      req.token,
    );
  }

  @Post('non-kontainer')
  @UseGuards(AuthGuard)
  @ApiBody({
    type: CreateNonContainerRequestDO,
  })
  @ApiBearerAuth()
  createDoNonKontainer(
    @Body() payload: CreateNonContainerRequestDO,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.createNonKontainer(
      payload.request,
      req.token,
    );
  }

  @Put('non-kontainer/:id')
  @UseGuards(AuthGuard)
  @ApiBody({
    type: UpdateNonContainerRequestDO,
  })
  @ApiBearerAuth()
  updateDoNonContainer(
    @Param('id') id: number,
    @Body() payload: UpdateNonContainerRequestDO,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.updateNonKontainer(
      +id,
      payload.request,
      req.token,
    );
  }

  @Put('shipping-line/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateCargoDetailSL,
  })
  updateDoSL(
    @Param('id') id: number,
    @Body() payload: UpdateCargoDetailSL,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.updateDoSL(
      +id,
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
}
