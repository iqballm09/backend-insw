import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { OidcGuard } from 'src/auth/guard/oidc.guard';
import { Request } from 'express';
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
