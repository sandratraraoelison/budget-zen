import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsIn,
  IsNumber,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsISO8601,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { IsMoney } from "../../../shared/presentation/validators";

export class BankLoanDto {
  @ApiProperty({ enum: ["fixed", "variable", "revolving"] })
  @IsIn(["fixed", "variable", "revolving"])
  rateType!: "fixed" | "variable" | "revolving";
  @ApiProperty() @IsNumber() @Min(0) @Max(100) annualRate!: number;
  @ApiProperty() @IsInt() @Min(1) @Max(600) termMonths!: number;
  @ApiProperty() @IsISO8601({ strict: true }) firstPaymentDate!: string;
  @ApiProperty() @IsMoney(true) insuranceMonthly!: number;
  @ApiProperty() @IsMoney(true) fees!: number;
  @ApiPropertyOptional()
  @ValidateIf((_o, v) => v !== undefined)
  @IsMoney()
  creditLimit?: number;
  @ApiPropertyOptional()
  @ValidateIf((_o, v) => v !== undefined)
  @IsString()
  @MaxLength(100)
  reference?: string;
}
export class CreditDto {
  @ApiPropertyOptional({ type: BankLoanDto })
  @ValidateIf((_o, v) => v !== undefined)
  @ValidateNested()
  @Type(() => BankLoanDto)
  bankLoan?: BankLoanDto;
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
  @ApiPropertyOptional()
  @ValidateIf((_o, v) => v !== undefined)
  @IsMoney(true)
  interest?: number;
  @ApiPropertyOptional()
  @ValidateIf((_o, v) => v !== undefined)
  @IsMoney(true)
  insurance?: number;
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
