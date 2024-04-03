import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getUserInfo(@Req() req: any) {
    return this.userService.getDetail(req.token);
  }
}
