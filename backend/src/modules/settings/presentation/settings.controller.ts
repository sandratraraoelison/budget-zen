import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";
import { CurrentUser } from "../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../auth/presentation/jwt-auth.guard";
import { SettingsService } from "../application/settings.service";

export class SettingsDto {
  @ApiProperty({ example: "EUR" })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;
}

@ApiTags("settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("settings")
export class SettingsController {
  constructor(private readonly service: SettingsService) {}
  @Get() get(@CurrentUser() user: string) {
    return this.service.get(user);
  }
  @Patch() update(@CurrentUser() user: string, @Body() input: SettingsDto) {
    return this.service.update(user, input.currency);
  }
}
