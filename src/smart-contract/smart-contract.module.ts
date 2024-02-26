import { Module } from '@nestjs/common';
import { SmartContractService } from './smart-contract.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  providers: [SmartContractService, SmartContractService, AuthService],
})
export class SmartContractModule {}
