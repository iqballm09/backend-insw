import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { UserRole } from '@prisma/client';
import { validateError } from 'src/util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async isAuthenticated(accessToken: string) {
    const userInfo = await this.userService.getDetail(accessToken);

    if (!userInfo.sub) {
      throw new UnauthorizedException('Access token is not valid');
    }

    const userExist = await this.prisma.user.findUnique({
      where: {
        name: userInfo.sub,
      },
    });

    // if (!userExist.hash) {
    //   throw new UnauthorizedException('User not created yet');
    // }

    return { success: true, data: { ...userInfo, roleId: userExist.roleId } };
  }

  async exchangeToken(code: string) {
    const form = new URLSearchParams();
    form.append('grant_type', 'authorization_code');
    form.append('code', code);
    form.append('redirect_uri', process.env.SSO_CALLBACK_URI);
    const Authorization = `Basic ${btoa(process.env.SSO_CLIENT_ID + ':' + process.env.SSO_CLIENT_SECRET)}`;

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization,
      },
    };

    try {
      const { data } = await axios.post(
        'https://sso.insw.go.id/connect/token',
        form,
        config,
      );

      // GET USER INFO
      const userInfo = await this.userService.getDetail(data.access_token);

      // CEK ON DB
      const userExist = await this.prisma.user.findUnique({
        where: {
          name: userInfo.sub,
        },
      });

      // IF NOT EXIST, REDIRECT TO SIGN UP PAGE
      if (!userExist) {
        const role = {
          id: userInfo.profile.details.kd_detail_ga ? 2 : 1,
          name: userInfo.profile.details.kd_detail_ga
            ? ('SL' as UserRole)
            : ('CO' as UserRole),
        };
        this.userService.create(userInfo.sub, role);
        // return {
        //   redirect: true,
        //   username: userInfo.sub,
        //   token: data.access_token,
        // };
      }

      // // IF USER STILL NOT HAVE PASSWORD, REDIRECT TO SIGN UP PAGE
      // if (!userExist.hash) {
      //   return {
      //     redirect: true,
      //     username: userInfo.sub,
      //     token: data.access_token,
      //   };
      // }

      return {
        token: data.access_token,
      };
    } catch (error) {
      console.log(error);

      validateError(error);
    }
  }
}
