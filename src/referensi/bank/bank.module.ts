import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [BankController],
  providers: [BankService, AuthService, UserService],
})
export class BankModule {}
