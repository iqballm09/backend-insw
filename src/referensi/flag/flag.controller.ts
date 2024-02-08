import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FlagService } from './flag.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('flag')
export class FlagController {
  constructor(private readonly flagService: FlagService) {}

  @Get('metode-bayar')
  @UseGuards(AuthGuard)
  findAllMetodeBayar(@Req() req: any) {
    return this.flagService.findAll(req.token, 'carabayar');
  }

  @Get('jenis-bl')
  @UseGuards(AuthGuard)
  findAllJenisBl(@Req() req: any) {
    return this.flagService.findAll(req.token, 'jenisbl');
  }

  @Get('ownership')
  @UseGuards(AuthGuard)
  findAllOwnership(@Req() req: any) {
    return this.flagService.findAll(req.token, 'ownership');
  }

  @Get('gross-weight')
  @UseGuards(AuthGuard)
  findAllGrossWeight(@Req() req: any) {
    return this.flagService.findAll(req.token, 'weight_uom');
  }

  @Get('package-unit')
  @UseGuards(AuthGuard)
  findAllPackageUnit(@Req() req: any) {
    return this.flagService.findAll(req.token, 'package_uom');
  }
}
