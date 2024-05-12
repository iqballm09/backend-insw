import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DepoDto } from 'src/delivery-order/dto/create-do.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DepoService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
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
}
