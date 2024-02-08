import { Module } from '@nestjs/common';
import { PelabuhanService } from './pelabuhan.service';
import { PelabuhanController } from './pelabuhan.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [PelabuhanService, AuthService, UserService],
  controllers: [PelabuhanController],
})
export class PelabuhanModule {}
