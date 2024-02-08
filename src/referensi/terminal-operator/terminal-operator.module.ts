import { Module } from '@nestjs/common';
import { TerminalOperatorService } from './terminal-operator.service';
import { TerminalOperatorController } from './terminal-operator.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [TerminalOperatorService, AuthService, UserService],
  controllers: [TerminalOperatorController],
})
export class TerminalOperatorModule {}
