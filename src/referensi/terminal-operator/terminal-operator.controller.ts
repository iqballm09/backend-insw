import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TerminalOperatorService } from './terminal-operator.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('terminal-operator')
@ApiTags('Data Referensi')
export class TerminalOperatorController {
  constructor(private readonly terminalOpService: TerminalOperatorService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.terminalOpService.findAll(req.token);
  }
}
