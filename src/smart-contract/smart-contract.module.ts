import { Module } from '@nestjs/common';
import { SmartContractService } from './smart-contract.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [SmartContractService, ConfigService],
})
export class SmartContractModule {}
