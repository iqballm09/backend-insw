import { Module } from '@nestjs/common';
import { BankModule } from './bank/bank.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DeliveryOrderModule } from './delivery-order/delivery-order.module';
import { PrismaModule } from './prisma/prisma.module';
import { FilesModule } from './files/files.module';
import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BankModule,
    AuthModule,
    DeliveryOrderModule,
    FilesModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AuthService, UserService],
})
export class AppModule {}
