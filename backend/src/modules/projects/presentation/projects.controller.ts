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
import { ProjectsService } from "../application/projects.service";
import { ExpenseDto, ProjectDto, UpdateProjectDto } from "./projects.dto";

@ApiTags("projects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("projects")
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}
  @Get() list(@CurrentUser() user: string) {
    return this.service.list(user);
  }
  @Get(":id") get(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.get(user, id);
  }
  @Post() create(@CurrentUser() user: string, @Body() dto: ProjectDto) {
    return this.service.create(user, dto);
  }
  @Patch(":id") update(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.service.update(user, id, dto);
  }
  @Delete(":id") @HttpCode(204) remove(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    this.service.remove(user, id);
  }
  @Post(":id/expenses") expense(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ExpenseDto,
  ) {
    return this.service.addExpense(user, id, dto);
  }
  @Delete(":id/expenses/:expenseId")
  @HttpCode(204)
  removeExpense(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("expenseId", ParseUUIDPipe) expenseId: string,
  ) {
    this.service.removeExpense(user, id, expenseId);
  }
}
