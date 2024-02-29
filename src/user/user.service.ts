import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { UserDto } from './entities/user.entity';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { validateError } from 'src/util';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getDetail(accessToken: string) {
    try {
      const { data } = await axios.get(
        'https://sso.insw.go.id/connect/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return data;
    } catch (error) {
      validateError(error);
    }
  }

  async create(name: string, role: { id: number; name: UserRole }) {
    return await this.prisma.user.create({
      data: {
        name: name,
        role: {
          connectOrCreate: {
            create: {
              name: role.name,
              id: role.id,
            },
            where: {
              id: role.id,
            },
          },
        },
      },
    });
  }

  async update(user: UserDto) {
    const hash = await bcrypt.hash(user.hash, 10);

    return await this.prisma.user.update({
      where: {
        name: user.name,
      },
      data: {
        hash,
      },
    });
  }
}
