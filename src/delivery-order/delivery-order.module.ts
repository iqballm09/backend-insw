import { Module } from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { DeliveryOrderController } from './delivery-order.controller';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { ShippinglineService } from 'src/referensi/shippingline/shippingline.service';
import { DepoService } from 'src/referensi/depo/depo.service';
import { SmartContractService } from 'src/smart-contract/smart-contract.service';

@Module({
  controllers: [DeliveryOrderController],
  providers: [
    DeliveryOrderService,
    UserService,
    AuthService,
    ShippinglineService,
    DepoService,
    SmartContractService,
  ],
})
export class DeliveryOrderModule {}
