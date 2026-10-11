import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "vous@example.com" })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ minLength: 12, maxLength: 128 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({ example: "Alex" })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/\S/)
  name!: string;
}
