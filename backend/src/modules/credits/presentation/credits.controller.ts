import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../auth/presentation/jwt-auth.guard";
import { CreditsService } from "../application/credits.service";
import { CreditDto, PaymentDto, UpdateCreditDto } from "./credits.dto";

@ApiTags("credits")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("credits")
export class CreditsController {
  constructor(private readonly service: CreditsService) {}
  @Get() list(@CurrentUser() user: string) {
    return this.service.list(user);
  }
  @Get(":id") get(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.get(user, id);
  }
  @Post() create(@CurrentUser() user: string, @Body() dto: CreditDto) {
    return this.service.create(user, dto);
  }
  @Patch(":id") update(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCreditDto,
  ) {
    return this.service.update(user, id, dto);
  }
  @Delete(":id") @HttpCode(204) remove(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    this.service.remove(user, id);
  }
  @Post(":id/payments") pay(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PaymentDto,
  ) {
    return this.service.addPayment(user, id, dto);
  }
  @Delete(":id/payments/:paymentId")
  @HttpCode(204)
  removePayment(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("paymentId", ParseUUIDPipe) paymentId: string,
  ) {
    this.service.removePayment(user, id, paymentId);
  }
}
