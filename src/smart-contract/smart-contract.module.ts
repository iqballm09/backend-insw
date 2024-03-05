import { Module } from '@nestjs/common';
import { SmartContractService } from './smart-contract.service';
import { SmartContractController } from './smart-contract.controller';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [SmartContractService, UserService, ConfigService],
  controllers: [SmartContractController],
})
export class SmartContractModule {}
