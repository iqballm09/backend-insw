import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SizeTypecodeService } from './size-typecode.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('size-typecode')
@ApiTags('Data Referensi')
export class SizeTypecodeController {
  constructor(private readonly sizetypeService: SizeTypecodeService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.sizetypeService.findAll(req.token);
  }
}
