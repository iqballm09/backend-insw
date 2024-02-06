import { Module } from '@nestjs/common';
import { BankModule } from './bank/bank.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DeliveryOrderModule } from './delivery-order/delivery-order.module';
import { PrismaModule } from './prisma/prisma.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    // BankModule,
    // AuthModule,
    DeliveryOrderModule,
    FilesModule,
  ],
})
export class AppModule {}
