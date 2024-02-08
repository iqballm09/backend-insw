import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StatusDoService } from './status-do.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('status-do')
export class StatusDoController {
  constructor(private statusDoService: StatusDoService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.statusDoService.findAll(req.token);
  }
}
