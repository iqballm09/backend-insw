import { Module } from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { DeliveryOrderController } from './delivery-order.controller';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { ShippinglineService } from 'src/referensi/shippingline/shippingline.service';

@Module({
  controllers: [DeliveryOrderController],
  providers: [
    DeliveryOrderService,
    UserService,
    AuthService,
    ShippinglineService,
  ],
})
export class DeliveryOrderModule {}
