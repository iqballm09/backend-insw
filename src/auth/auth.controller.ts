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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { OidcGuard } from './guard/oidc.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(OidcGuard)
  @Get('sso')
  sso(@Req() request: Request) {
    console.log({ request });
  }

  @Get('callback')
  findAll() {
    console.log('tes');
    return {};
    // return this.authService.findAll();
  }
}
