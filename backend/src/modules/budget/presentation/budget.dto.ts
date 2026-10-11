import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
  IsIn,
  IsUUID,
  IsISO8601,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { IsMoney } from "../../../shared/presentation/validators";
import {
  CATEGORIES,
  type Category,
  type TransactionType,
} from "../domain/models";

export class TransactionDto {
  @ApiPropertyOptional({ example: "Voyage" })
  @ValidateIf((_o, value) => value !== undefined)
  @IsString()
  @MaxLength(100)
  customCategoryName?: string;

  @ApiPropertyOptional()
  @ValidateIf((_o, value) => value !== undefined)
  @IsUUID()
  clientId?: string;
  @ApiProperty({ example: 120.5 }) @IsMoney() amount!: number;
  @ApiProperty({ example: "2026-10-11" })
  @IsISO8601({ strict: true })
  date!: string;
  @ApiProperty({ example: "Courses" })
  @IsString()
  @Matches(/\S/)
  @MaxLength(500)
  description!: string;
  @ApiProperty({ enum: CATEGORIES }) @IsIn(CATEGORIES) category!: Category;
  @ApiProperty({ enum: ["income", "expense"] })
  @IsIn(["income", "expense"])
  type!: TransactionType;
}
export class UpdateTransactionDto extends PartialType(TransactionDto, {
  skipNullProperties: false,
}) {}

export class BudgetDto {
  @ApiPropertyOptional({ example: "Voyage" })
  @ValidateIf((_o, value) => value !== undefined)
  @IsString()
  @MaxLength(100)
  customCategoryName?: string;

  @ApiProperty({ enum: CATEGORIES }) @IsIn(CATEGORIES) category!: Category;
  @ApiProperty({ example: 500 }) @IsMoney() limit!: number;
}
export class UpdateBudgetDto extends PartialType(BudgetDto, {
  skipNullProperties: false,
}) {}

export class GoalDto {
  @ApiProperty({ example: "Vacances" })
  @IsString()
  @Matches(/\S/)
  @MaxLength(100)
  name!: string;
  @ApiProperty({ example: 3000 }) @IsMoney() target!: number;
  @ApiPropertyOptional({ example: 0 })
  @ValidateIf((_o, value) => value !== undefined)
  @IsMoney(true)
  current?: number;
  @ApiProperty({ example: "2027-06-01" })
  @IsISO8601({ strict: true })
  deadline!: string;
}
export class UpdateGoalDto extends PartialType(GoalDto, {
  skipNullProperties: false,
}) {}

export class CustomCategoryDto {
  @ApiPropertyOptional()
  @ValidateIf((_o, value) => value !== undefined)
  @IsIn(CATEGORIES.filter((c) => c !== "autres"))
  baseCategory?: Category;
  @ApiPropertyOptional()
  @ValidateIf((_o, value) => value !== undefined)
  @IsIn([
    "tag",
    "paw",
    "home",
    "food",
    "car",
    "heart",
    "book",
    "gift",
    "wallet",
    "plane",
  ])
  icon?: string;
  @ApiProperty({ example: "Voyage" })
  @IsString()
  @Matches(/\S/)
  @MaxLength(100)
  name!: string;
  @ApiProperty({ example: 1000 }) @IsMoney(true) budget!: number;
}
export class UpdateCustomCategoryDto extends PartialType(CustomCategoryDto, {
  skipNullProperties: false,
}) {}

export class CategoryOrderDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsString({ each: true })
  ids!: string[];
}
