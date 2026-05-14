import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Today I started building my coursework social network.' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;

  @ApiPropertyOptional({ example: '/uploads/posts/example.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;
}
