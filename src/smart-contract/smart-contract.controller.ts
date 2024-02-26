import { Controller, Get } from '@nestjs/common';
import { SmartContractService } from './smart-contract.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('smart-contract')
@ApiTags('Smart Contract')
export class SmartContractController {
  constructor(private smartContractService: SmartContractService) {}

  @Get('do')
  async getAllDo() {
    return this.smartContractService.getAllDoData();
  }
}
