import { Module } from '@nestjs/common';
import { SmartContractService } from './smart-contract.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [SmartContractService, SmartContractService, AuthService, UserService],
})
export class SmartContractModule {}
