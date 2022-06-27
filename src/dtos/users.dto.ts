import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}

export class UserWithAccessToken extends CreateUserDto {
  @IsString()
  public accessToken: string;
}
