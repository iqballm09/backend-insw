import { Module } from '@nestjs/common';
import { DepoService } from './depo.service';
import { UserService } from 'src/user/user.service';
import { DepoController } from './depo.controller';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [DepoService, UserService, AuthService, ConfigService],
  controllers: [DepoController]
})
export class DepoModule {}
