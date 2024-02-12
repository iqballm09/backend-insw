import { Module } from '@nestjs/common';
import { DepoService } from './depo.service';
import { UserService } from 'src/user/user.service';
import { DepoController } from './depo.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  providers: [DepoService, UserService, AuthService],
  controllers: [DepoController]
})
export class DepoModule {}
