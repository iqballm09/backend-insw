import { Module } from '@nestjs/common';
import { NegaraService } from './negara.service';
import { NegaraController } from './negara.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [NegaraService, AuthService, UserService],
  controllers: [NegaraController],
})
export class NegaraModule {}
