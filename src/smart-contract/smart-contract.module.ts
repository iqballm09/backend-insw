import { Module } from '@nestjs/common';
import { SmartContractService } from './smart-contract.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { SmartContractController } from './smart-contract.controller';

@Module({
  providers: [SmartContractService, SmartContractService, AuthService, UserService],
  controllers: [SmartContractController],
})
export class SmartContractModule {}
