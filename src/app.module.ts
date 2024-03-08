import { Module } from '@nestjs/common';
import { BankModule } from './referensi/bank/bank.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DeliveryOrderModule } from './delivery-order/delivery-order.module';
import { PrismaModule } from './prisma/prisma.module';
import { FilesModule } from './files/files.module';
import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { KursModule } from './referensi/kurs/kurs.module';
import { ShippinglineModule } from './referensi/shippingline/shippingline.module';
import { NegaraModule } from './referensi/negara/negara.module';
import { KabkotaModule } from './referensi/kabkota/kabkota.module';
import { TerminalOperatorModule } from './referensi/terminal-operator/terminal-operator.module';
import { SizeTypecodeModule } from './referensi/size-typecode/size-typecode.module';
import { StatusDoModule } from './referensi/status-do/status-do.module';
import { FlagModule } from './referensi/flag/flag.module';
import { PelabuhanModule } from './referensi/pelabuhan/pelabuhan.module';
import { SupportingDocumentModule } from './referensi/supporting-document/supporting-document.module';
import { DepoModule } from './referensi/depo/depo.module';
import { SmartContractModule } from './smart-contract/smart-contract.module';
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
    SupportingDocumentModule,
    DepoModule,
    SmartContractModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
