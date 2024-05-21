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
  Res,
  UnsupportedMediaTypeException,
  UseGuards,
} from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CargoVinDetail,
  Container,
  CreateContainerRequestDO,
  CreateNonContainerRequestDO,
  PaymentSupportingDetail,
  RequestDetail,
  RequestPartiesDetail,
  UpdateCargoDetailSL,
  UpdateContainerRequestDO,
  UpdateDoSLDto,
  UpdateNonContainerRequestDO,
} from './dto/create-do.dto';
import { StatusDo } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@ApiTags('Delivery Order')
@Controller('do')
export class DeliveryOrderController {
  constructor(
    private readonly deliveryOrderService: DeliveryOrderService,
    private readonly userService: UserService,
  ) {}

  @Put('kontainer/:id?')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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

  @Post('forms/request-detail')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiBody({
    type: RequestDetail,
  })
  @ApiBearerAuth()
  createRequestDetail(@Body() payload: RequestDetail, @Req() req: any) {
    return this.deliveryOrderService.createRequestDetail(payload, req.token);
  }

  @Get('forms/request-detail/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getRequestDetail(@Param('id') id: number, @Req() req: any) {
    return this.deliveryOrderService.getRequestDetail(+id, req.token);
  }

  @Put('forms/request-detail/:id?')
  @UseGuards(AuthGuard)
  @ApiBody({
    type: RequestDetail,
  })
  @ApiQuery({ name: 'status', enum: StatusDo })
  @ApiBearerAuth()
  updateRequestDetail(
    @Param('id') id: number,
    @Body() payload: RequestDetail,
    @Req() req: any,
    @Query('status') status: StatusDo,
  ) {
    return this.deliveryOrderService.updateRequestDetail(
      +id,
      payload,
      req.token,
      status,
    );
  }

  @Post('forms/parties-detail/:id')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: RequestPartiesDetail,
  })
  createRequestPartiesDetail(
    @Param('id') id: number,
    @Body() payload: RequestPartiesDetail,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.createRequestPartiesDetail(
      +id,
      payload,
      req.token,
    );
  }

  @Get('forms/parties-detail/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getRequestPartiesDetail(@Param('id') id: number, @Req() req: any) {
    return this.deliveryOrderService.getRequestPartiesDetail(+id, req.token);
  }

  @Post('forms/payment-document/:id')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  createPaymentDocument(
    @Param('id') id: number,
    @Body() payload: PaymentSupportingDetail,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.createPaymentSupportingDetail(
      +id,
      payload,
      req.token,
    );
  }

  @Get('forms/payment-document/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getPaymentDocument(@Param('id') id: number, @Req() req: any) {
    return this.deliveryOrderService.getPaymentSupportingDetail(+id, req.token);
  }

  @Post('forms/kontainer-detail/:id?')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'status', enum: StatusDo })
  @ApiBearerAuth()
  createContainerDetail(
    @Param('id') id: number,
    @Body() payload: Container[],
    @Req() req: any,
    @Query('status') status: StatusDo,
  ) {
    return this.deliveryOrderService.createContainerDetail(
      +id,
      payload,
      req.token,
      status,
    );
  }

  @Get('forms/kontainer-detail/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getContainerDetail(@Param('id') id: number, @Req() req: any) {
    return this.deliveryOrderService.getContainerDetail(+id, req.token);
  }

  @Delete('forms/kontainer-detail/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  deleteContainerDetail(@Param('id') id: number, @Req() req: any) {
    return this.deliveryOrderService.deleteContainerDetail(+id, req.token);
  }

  @Post('forms/cargovin-detail/:id')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  createCargoVinDetail(
    @Param('id') id: number,
    @Body() payload: CargoVinDetail,
    @Req() req: any,
  ) {
    return this.deliveryOrderService.createCargoVinDetail(
      +id,
      payload,
      req.token,
    );
  }

  @Get('forms/cargovin-detail/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getCargoVinDetail(@Param('id') id: number, @Req() req: any) {
    return this.deliveryOrderService.getCargoVinDetail(+id, req.token);
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

  @Put('shipping-line/status/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update status DO immediately when SL processed DO Request',
  })
  updateDoStatusProcessSL(@Param('id') id: number, @Req() req: any) {
    return this.deliveryOrderService.updateStatusDoProcessSL(+id, req.token);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getAllDoData(@Req() req: any) {
    // get user info
    const userInfo = await this.userService.getDetail(req.token);
    // CASE 1 : IF USER HAS KD_DETAIL_GA, GET DO DATA FOR SL
    if (userInfo.profile.details.kd_detail_ga) {
      return this.deliveryOrderService.getAllDoSL(
        userInfo.sub,
        userInfo.profile.details.kd_detail_ga,
        req.token,
      );
    }
    // CASE 2: IF USER DOEST'NT HAVE KD_DETAIL_GA, GET DO DATA FOR CO
    return this.deliveryOrderService.getAllDoCo(userInfo.sub);
  }

  @Get('status-reqdo/:id')
  getAllStatusDo(@Param('id') id: number) {
    return this.deliveryOrderService.getAllStatus(+id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getDoDetail(@Param('id') id: string, @Req() req: any) {
    return this.deliveryOrderService.getDoDetail(+id, req.token);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  deleteModel(@Param('id') id: string, @Req() req: any) {
    return this.deliveryOrderService.deleteDo(+id, req.token);
  }

  @Get('print/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async printDoPdf(@Param('id') id: string, @Req() req: any) {
    const _ = await this.deliveryOrderService.printDo(+id, req.token);
    return {
      urlFile: `${process.env.API_URI}/files/download/${+id}`,
    };
  }
}
