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
      return res.redirect('http://localhost:5000/auth/signin');
    }

    const authResult = await this.auth.exchangeToken(code);

    if (authResult.redirect) {
      return res.redirect(
        `http://localhost:3000/signup?sub=${authResult.username}&token=${authResult.token}`,
      );
    }

    return res.redirect(`http://localhost:3000/?token=${authResult.token}`);
  }
}
