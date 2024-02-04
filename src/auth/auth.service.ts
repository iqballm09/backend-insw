import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  async validateToken(accessToken: string) {
    const res = await axios.get('https://sso.insw.go.id/connect/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.data;
  }

  async refreshToken(accessToken: string) {
    const res = await axios.get('https://sso.insw.go.id/connect/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.data;
  }
}
