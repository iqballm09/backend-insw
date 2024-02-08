import { Module } from '@nestjs/common';
import { KursService } from './kurs.service';
import { KursController } from './kurs.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [KursService, AuthService, UserService],
  controllers: [KursController],
})
export class KursModule {}
