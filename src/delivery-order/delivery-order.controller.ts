import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnsupportedMediaTypeException,
  UseGuards,
} from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateContainerRequestDO,
  CreateNonContainerRequestDO,
  UpdateCargoDetailSL,
  UpdateContainerRequestDO,
  UpdateDoSLDto,
  UpdateNonContainerRequestDO,
} from './dto/create-do.dto';
import { StatusDo } from '@prisma/client';

@ApiTags('Delivery Order')
@Controller('do')
export class DeliveryOrderController {
  constructor(private readonly deliveryOrderService: DeliveryOrderService) {}

  @Post('kontainer?')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: CreateContainerRequestDO,
  })
  @ApiQuery({ name: 'status', enum: StatusDo })
  createDoKontainer(
    @Body() payload: CreateContainerRequestDO,
    @Query('status') status: StatusDo,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.createKontainer(
      payload.request,
      req.token,
      status,
    );
  }

  @Put('kontainer/:id?')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateContainerRequestDO,
  })
  @ApiQuery({ name: 'status', enum: StatusDo })
  updateDoKontainer(
    @Param('id') id: number,
    @Body() payload: UpdateContainerRequestDO,
    @Query('status') status: StatusDo,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.updateKontainer(
      +id,
      payload.request,
      req.token,
      status,
    );
  }

  @Post('non-kontainer?')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiBody({
    type: CreateNonContainerRequestDO,
  })
  @ApiQuery({ name: 'status', enum: StatusDo })
  @ApiBearerAuth()
  createDoNonKontainer(
    @Body() payload: CreateNonContainerRequestDO,
    @Req() req: any,
    @Query('status') status: StatusDo,
  ) {
    return this.deliveryOrderService.createNonKontainer(
      payload.request,
      req.token,
      status,
    );
  }

  @Put('non-kontainer/:id?')
  @UseGuards(AuthGuard)
  @ApiBody({
    type: UpdateNonContainerRequestDO,
  })
  @ApiQuery({ name: 'status', enum: StatusDo })
  @ApiBearerAuth()
  updateDoNonContainer(
    @Param('id') id: number,
    @Body() payload: UpdateNonContainerRequestDO,
    @Req() req: any,
    @Query('status') status: StatusDo,
  ) {
    return this.deliveryOrderService.updateNonKontainer(
      +id,
      payload.request,
      req.token,
      status,
    );
  }

  @Put('shipping-line/:id?')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'status', enum: StatusDo })
  @ApiBody({
    type: UpdateCargoDetailSL,
  })
  updateDoSL(
    @Param('id') id: number,
    @Body() payload: UpdateCargoDetailSL,
    @Query('status') status: StatusDo,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.updateDoSL(
      +id,
      payload.request,
      req.token,
      status,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getAllDo(@Req() req: any) {
    return this.deliveryOrderService.getAllDoCo(req.token);
  }

  @Get('status-reqdo/:id')
  getAllStatusDo(@Param('id') id: number) {
    return this.deliveryOrderService.getAllStatus(+id);
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
  deleteModel(@Param('id') id: string, @Req() req: any) {
    return this.deliveryOrderService.deleteDo(+id, req.token);
  }
}
