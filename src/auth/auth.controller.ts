import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Headers,
  Res,
  BadRequestException,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { OidcGuard } from './guard/oidc.guard';
import { Request, Response } from 'express';
import { UserDto } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  @Post()
  checkAuth(@Headers('authorization') authorization: string) {
    const token = authorization.split(' ')[1];
    return this.authService.isAuthenticated(token);
  }

  @Post('signup')
  async signUp(@Query('token') token: string, @Body() user: UserDto) {
    if (!token) {
      throw new BadRequestException('Query token is required');
    }

    const userToken = await this.userService.getDetail(token);

    if (userToken.sub != user.name) {
      throw new ForbiddenException('Credentials is different');
    }

    const createdUser = await this.userService.update(user);
    if (!createdUser) {
      throw new BadRequestException();
    }

    return { accessToken: token };
  }

  @Get('/signout')
  doLogout(@Res() res: Response) {
    return res.redirect(
      'https://sso.insw.go.id/connect/session/end?post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A5000&client_id=90b61241-8687-40f8-942d-391b54529936&attempt=ask',
    );
  }

  @UseGuards(OidcGuard)
  @Get('signin')
  signIn() {}
}
