import { Module } from '@nestjs/common';
import { SizeTypecodeService } from './size-typecode.service';
import { SizeTypecodeController } from './size-typecode.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [SizeTypecodeService, AuthService, UserService],
  controllers: [SizeTypecodeController],
})
export class SizeTypecodeModule {}
