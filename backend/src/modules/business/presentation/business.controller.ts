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
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../auth/presentation/jwt-auth.guard";
import { BusinessService } from "../application/business.service";
import {
  BusinessQueryDto,
  BusinessTransactionDto,
  UpdateBusinessTransactionDto,
} from "./business.dto";

@ApiTags("business")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("business")
export class BusinessController {
  constructor(private readonly service: BusinessService) {}
  @Get("transactions") list(@CurrentUser() user: string) {
    return this.service.list(user);
  }
  @Post("transactions") create(
    @CurrentUser() user: string,
    @Body() dto: BusinessTransactionDto,
  ) {
    return this.service.create(user, dto);
  }
  @Patch("transactions/:id") update(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBusinessTransactionDto,
  ) {
    return this.service.update(user, id, dto);
  }
  @Delete("transactions/:id") @HttpCode(204) remove(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    this.service.remove(user, id);
  }
  @Get("analytics") analytics(
    @CurrentUser() user: string,
    @Query() query: BusinessQueryDto,
  ) {
    return this.service.analytics(user, query.timeRange, query.date);
  }
}
