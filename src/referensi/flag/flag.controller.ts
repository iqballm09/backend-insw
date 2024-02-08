import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FlagService } from './flag.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('flag')
@ApiTags('Data Referensi')
export class FlagController {
  constructor(private readonly flagService: FlagService) {}

  @Get('metode-bayar')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAllMetodeBayar(@Req() req: any) {
    return this.flagService.findAll(req.token, 'carabayar');
  }

  @Get('jenis-bl')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAllJenisBl(@Req() req: any) {
    return this.flagService.findAll(req.token, 'jenisbl');
  }

  @Get('ownership')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAllOwnership(@Req() req: any) {
    return this.flagService.findAll(req.token, 'ownership');
  }

  @Get('gross-weight')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAllGrossWeight(@Req() req: any) {
    return this.flagService.findAll(req.token, 'weight_uom');
  }

  @Get('package-unit')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAllPackageUnit(@Req() req: any) {
    return this.flagService.findAll(req.token, 'package_uom');
  }
}
