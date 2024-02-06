import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getUserInfo(@Headers('authorization') authorization: string) {
    // Mengambil token bearer dari header
    const token = authorization.split(' ')[1]; // Split untuk mengambil token setelah 'Bearer '
    // Lakukan apa pun yang perlu Anda lakukan dengan token di sini
    // console.log('Token Bearer:', token);
    return this.userService.getDetail(token);
  }
}
