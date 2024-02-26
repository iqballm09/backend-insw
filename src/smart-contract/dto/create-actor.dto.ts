import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'co' })
  id: String;
  @ApiProperty({ example: 'secret' })
  secret: String;
}
