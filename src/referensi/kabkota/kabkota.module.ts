import { Module } from '@nestjs/common';
import { KabkotaService } from './kabkota.service';
import { KabkotaController } from './kabkota.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [KabkotaService, AuthService, UserService],
  controllers: [KabkotaController],
})
export class KabkotaModule {}
