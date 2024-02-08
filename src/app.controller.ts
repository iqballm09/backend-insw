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
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { OidcGuard } from './auth/guard/oidc.guard';
import { Response } from 'express';

@Controller('/')
export class AppController {
  constructor(private auth: AuthService) {}

  @Get('')
  async sso(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.redirect(`${process.env.API_URI}/auth/signin`);
    }

    const authResult = await this.auth.exchangeToken(code);

    if (authResult.redirect) {
      return res.redirect(
        `${process.env.WEB_URI}/signup?sub=${authResult.username}&token=${authResult.token}`,
      );
    }

    res.cookie('access_token', authResult.token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    res.redirect(process.env.WEB_URI);
  }
}
