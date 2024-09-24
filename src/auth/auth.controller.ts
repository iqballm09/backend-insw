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
import { OidcGuard } from './guard/oidc.guard';
import { Request, Response } from 'express';
import { UserDto } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from './guard/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  checkAuth(@Req() req: any) {
    return this.authService.isAuthenticated(req.token);
  }

  @Post('signup')
  @ApiBody({
    type: UserDto,
  })
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

    return { message: 'Account successfully created!' };
  }

  @Get('/signout')
  doLogout(@Res() res: Response) {
    res.cookie('access_token', '', {
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    res.redirect(process.env.SSO_LOGOUT_URI);
  }

  @UseGuards(OidcGuard)
  @Get('signin')
  signIn() {}
}
