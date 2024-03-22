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
  CreateContainerRequestDO,
  CreateNonContainerRequestDO,
  UpdateCargoDetailSL,
  UpdateContainerRequestDO,
  UpdateDoSLDto,
  UpdateNonContainerRequestDO,
} from './dto/create-do.dto';
import { StatusDo } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { identity } from 'rxjs';

@ApiTags('Delivery Order')
@Controller('do')
export class DeliveryOrderController {
  constructor(
    private readonly deliveryOrderService: DeliveryOrderService,
    private readonly userService: UserService,
  ) {}

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
  async printDoPdf(@Param('id') id: string, @Req() req: any, @Res() res) {
    return this.deliveryOrderService.printDo(+id, req.token, res);
  }
}
