import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [BankController],
  providers: [BankService, AuthService],
})
export class BankModule {}
