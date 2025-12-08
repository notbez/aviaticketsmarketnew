import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleOAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}