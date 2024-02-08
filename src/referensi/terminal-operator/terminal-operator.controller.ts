import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TerminalOperatorService } from './terminal-operator.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('terminal-operator')
export class TerminalOperatorController {
  constructor(private readonly terminalOpService: TerminalOperatorService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.terminalOpService.findAll(req.token);
  }
}
