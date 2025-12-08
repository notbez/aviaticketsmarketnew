import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsOptional()
  @IsString()
  passportCountry?: string;

  @IsOptional()
  @IsString()
  passportExpiryDate?: string;

  @IsBoolean()
  termsAccepted: boolean;

  @IsBoolean()
  notificationsAccepted: boolean;
}