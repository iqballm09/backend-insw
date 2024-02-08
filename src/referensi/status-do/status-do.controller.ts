import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StatusDoService } from './status-do.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('status-do')
@ApiTags('Data Referensi')
export class StatusDoController {
  constructor(private statusDoService: StatusDoService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.statusDoService.findAll(req.token);
  }
}
