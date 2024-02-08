import { Module } from '@nestjs/common';
import { FlagService } from './flag.service';
import { FlagController } from './flag.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [FlagService, AuthService, UserService],
  controllers: [FlagController],
})
export class FlagModule {}
