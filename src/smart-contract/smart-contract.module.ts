import { Module } from '@nestjs/common';
import { SmartContractService } from './smart-contract.service';

@Module({
  providers: [SmartContractService, SmartContractService]
})
export class SmartContractModule {}
