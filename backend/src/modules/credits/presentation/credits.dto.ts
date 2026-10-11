import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsIn,
  IsISO8601,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { IsMoney } from "../../../shared/presentation/validators";

export class CreditDto {
  @ApiProperty({ example: "Alex" })
  @IsString()
  @Matches(/\S/)
  @MaxLength(100)
  contact!: string;
  @ApiProperty({ example: 1000 }) @IsMoney() initialAmount!: number;
  @ApiProperty({ enum: ["borrowed", "lent"] })
  @IsIn(["borrowed", "lent"])
  type!: "borrowed" | "lent";
  @ApiProperty({ example: "2026-10-11" })
  @IsISO8601({ strict: true })
  startDate!: string;
  @ApiPropertyOptional({ example: "2026-12-01" })
  @ValidateIf((_o, v) => v !== undefined)
  @IsISO8601({ strict: true })
  endDate?: string;
}
export class UpdateCreditDto extends PartialType(CreditDto, {
  skipNullProperties: false,
}) {}
export class PaymentDto {
  @ApiProperty({ example: 250 }) @IsMoney() amount!: number;
  @ApiProperty({ example: "2026-10-12" })
  @IsISO8601({ strict: true })
  date!: string;
  @ApiPropertyOptional()
  @ValidateIf((_o, v) => v !== undefined)
  @IsString()
  @MaxLength(500)
  note?: string;
}
