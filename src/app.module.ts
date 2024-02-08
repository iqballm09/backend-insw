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
import { KursModule } from './kurs/kurs.module';
import { ShippinglineModule } from './shippingline/shippingline.module';
import { NegaraModule } from './negara/negara.module';
import { KabkotaModule } from './kabkota/kabkota.module';
import { TerminalOperatorModule } from './terminal-operator/terminal-operator.module';
import { SizeTypecodeModule } from './size-typecode/size-typecode.module';
import { StatusDoModule } from './status-do/status-do.module';
import { FlagModule } from './flag/flag.module';
import { PelabuhanModule } from './pelabuhan/pelabuhan.module';

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
    KursModule,
    ShippinglineModule,
    NegaraModule,
    KabkotaModule,
    TerminalOperatorModule,
    SizeTypecodeModule,
    StatusDoModule,
    FlagModule,
    PelabuhanModule,
  ],
  controllers: [AppController],
  providers: [AuthService, UserService],
})
export class AppModule {}
