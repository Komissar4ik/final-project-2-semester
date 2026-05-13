import { ApiProperty } from '@nestjs/swagger';

class AuthUserDto {
  @ApiProperty({ example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  id: string;

  @ApiProperty({ example: 'student@example.com' })
  email: string;

  @ApiProperty({ example: 'Alex Student' })
  displayName: string;

  @ApiProperty({ example: 'USER' })
  role: string;
}

export class AuthResponseDto {
  @ApiProperty()
  user: AuthUserDto;

  @ApiProperty({ example: 'jwt.access.token' })
  accessToken: string;
}
