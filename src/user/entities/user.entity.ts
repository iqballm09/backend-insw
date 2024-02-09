import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    example: 'admin_demo_co',
  })
  name: string;
  @ApiProperty({
    example: 'P@ssw0rd',
  })
  hash: string;
}
