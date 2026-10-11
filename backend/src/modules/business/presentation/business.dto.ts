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
import type { TimeRange } from "../domain/models";

export class BusinessTransactionDto {
  @ApiProperty({ enum: ["income", "expense"] })
  @IsIn(["income", "expense"])
  type!: "income" | "expense";
  @ApiProperty({ example: 100 }) @IsMoney() amount!: number;
  @ApiProperty({ example: "2026-10-11" })
  @IsISO8601({ strict: true })
  date!: string;
  @ApiProperty({ example: "Vente produit" })
  @IsString()
  @Matches(/\S/)
  @MaxLength(100)
  category!: string;
  @ApiProperty({ example: "Facture client" })
  @IsString()
  @Matches(/\S/)
  @MaxLength(500)
  description!: string;
}
export class UpdateBusinessTransactionDto extends PartialType(
  BusinessTransactionDto,
  { skipNullProperties: false },
) {}
export class BusinessQueryDto {
  @ApiPropertyOptional({ enum: ["month", "quarter", "year"], default: "month" })
  @IsIn(["month", "quarter", "year"])
  timeRange: TimeRange = "month";
  @ApiPropertyOptional({ example: "2026-10-11" })
  @ValidateIf((_o, v) => v !== undefined)
  @IsISO8601({ strict: true })
  date?: string;
}
