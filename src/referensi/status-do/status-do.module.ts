import { Module } from '@nestjs/common';
import { StatusDoService } from './status-do.service';
import { StatusDoController } from './status-do.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [StatusDoService, AuthService, UserService],
  controllers: [StatusDoController],
})
export class StatusDoModule {}
