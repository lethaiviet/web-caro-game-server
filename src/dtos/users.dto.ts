import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}

export class VerifyAccessTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  public accessToken: string;
}

export class UploadAvartarDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  public email: string;

  @IsOptional()
  @IsString()
  public password: string;

  @IsOptional()
  @IsString()
  public bio: string;

  @IsOptional()
  @IsString()
  // @Matches(/^[A-Z]+$/i)
  public name: string;

  @IsOptional()
  public avatar: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  public exp: number;

  @IsOptional()
  @IsString()
  public avatarLocalPath: string;
}
