import { Module } from '@nestjs/common';
import { ShippinglineService } from './shippingline.service';
import { ShippinglineController } from './shippingline.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [ShippinglineService, AuthService, UserService],
  controllers: [ShippinglineController],
})
export class ShippinglineModule {}
