import { Module } from '@nestjs/common';
import { SmartContractService } from './smart-contract.service';
import { SmartContractController } from './smart-contract.controller';

@Module({
  providers: [SmartContractService, SmartContractService],
  controllers: [SmartContractController],
})
export class SmartContractModule {}
