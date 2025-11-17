import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  // full name
  @IsOptional()
  @IsString()
  name?: string;

  // handle (e.g. @elonmusk)
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  imageFile?: any;
}
