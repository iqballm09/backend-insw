import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { BankService } from './bank.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.bankService.findAll(req.token);
  }
}
