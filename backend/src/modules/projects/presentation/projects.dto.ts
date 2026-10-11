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

export class ProjectDto {
  @ApiPropertyOptional()
  @ValidateIf((_o, v) => v !== undefined)
  @IsMoney(true)
  savedFund?: number;
  @ApiPropertyOptional({ example: "2026-12-15", nullable: true })
  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @IsISO8601({ strict: true })
  targetDate?: string | null;
  @ApiProperty({ example: "Maison" })
  @IsString()
  @Matches(/\S/)
  @MaxLength(100)
  name!: string;
  @ApiProperty({ example: 1000 }) @IsMoney(true) initialFund!: number;
  @ApiPropertyOptional({ example: "2026-10-11" })
  @ValidateIf((_o, v) => v !== undefined)
  @IsISO8601({ strict: true })
  startDate?: string;
}
export class UpdateProjectDto extends PartialType(ProjectDto, {
  skipNullProperties: false,
}) {
  @ApiPropertyOptional({ enum: ["en-cours", "achevée"] })
  @ValidateIf((_o, v) => v !== undefined)
  @IsIn(["en-cours", "achevée"])
  status?: "en-cours" | "achevée";
}
export class ExpenseDto {
  @ApiProperty({ example: "Matériaux" })
  @IsString()
  @Matches(/\S/)
  @MaxLength(500)
  description!: string;
  @ApiProperty({ example: 100 }) @IsMoney() amount!: number;
  @ApiProperty({ example: "2026-10-12" })
  @IsISO8601({ strict: true })
  date!: string;
  @ApiProperty({ example: "construction" })
  @IsString()
  @Matches(/\S/)
  @MaxLength(100)
  category!: string;
}

export class ProjectContributionDto {
  @ApiProperty({ enum: ["add", "withdraw"] })
  @IsIn(["add", "withdraw"])
  direction!: "add" | "withdraw";
  @ApiProperty() @IsMoney() amount!: number;
}
