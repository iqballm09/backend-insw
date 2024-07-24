import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { DepoEntity } from './entities/depo.entity';
import { validateError } from 'src/util';

@Injectable()
export class DepoService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private configService: ConfigService
  ) {}

  async getAllDepo(token: string) {
    const userInfo = await this.userService.getDetail(token);

    // CHECK IF USER ROLE IS SL
    if (!userInfo.profile.details.kd_detail_ga) {
      throw new BadRequestException(`Failed to get all depo, role is not SL`);
    }

    const data = await this.prisma.td_depo.findMany({
      where: {
        created_by: userInfo.sub,
      },
    });
    const results = data.map((depo) => ({
      depoId: depo.id,
      nama: depo.deskripsi,
      npwp: depo.npwp,
      alamat: depo.alamat,
      noTelp: depo.no_telp,
      kota: depo.id_kabkota,
      kodePos: depo.kode_pos,
    }));
    return results;
  }

  async findAll(token: string) {
    try {
      const { data } = await axios.get(
        `https://api.insw.go.id/api/doSp/getListDepo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result: DepoEntity[] = data.data.map((item: any) => ({
        kode: item.kodeBank,
        uraian: item.uraianBank,
        display: item.kodeBank + ' | ' + item.uraianBank,
      }));
      return {
        data: result,
      };
    } catch (e) {
      validateError(e);
    }
  }
}
