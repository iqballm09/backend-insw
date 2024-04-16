import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { UserDto } from './entities/user.entity';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { validateError } from 'src/util';
import { v4 as uuidv4 } from 'uuid';

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
        hash: uuidv4(),
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

  async getUserDB(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        name: username,
      },
    });
    if (!user) {
      throw new NotFoundException(`User by Id = ${username} not found on DB!`);
    }
    return user;
  }

  async update(user: UserDto) {
    const hash = await bcrypt.hash(user.hash, 10);

    const updatedData = await this.prisma.user.update({
      where: {
        name: user.name,
      },
      data: {
        hash,
      },
    });

    return updatedData;
  }
}
