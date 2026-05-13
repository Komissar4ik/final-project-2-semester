import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export enum OAuthProviderDto {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  YANDEX = 'YANDEX',
}

export class OAuthCallbackDto {
  @ApiProperty({ enum: OAuthProviderDto, example: OAuthProviderDto.GOOGLE })
  @IsEnum(OAuthProviderDto)
  provider: OAuthProviderDto;

  @ApiProperty({ example: 'google-user-123' })
  @IsString()
  @MinLength(1)
  providerUserId: string;

  @ApiProperty({ example: 'student@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Alex Student' })
  @IsString()
  @MinLength(2)
  displayName: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  avatarUrl?: string;
}
