import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SizeTypecodeService } from './size-typecode.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('size-typecode')
export class SizeTypecodeController {
  constructor(private readonly sizetypeService: SizeTypecodeService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.sizetypeService.findAll(req.token);
  }
}
