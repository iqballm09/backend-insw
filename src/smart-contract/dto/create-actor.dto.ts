import { ApiProperty } from '@nestjs/swagger';

export class CreateActorDto {
  @ApiProperty({ example: 'co' })
  Id: String;
  @ApiProperty({ example: 'secret' })
  Secret: String;
}
