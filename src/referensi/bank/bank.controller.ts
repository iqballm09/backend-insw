import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { BankService } from './bank.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('bank')
@ApiTags('Data Referensi')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.bankService.findAll(req.token);
  }
}
