import { Module } from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { DeliveryOrderController } from './delivery-order.controller';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [DeliveryOrderController],
  providers: [DeliveryOrderService, UserService, AuthService],
})
export class DeliveryOrderModule {}
