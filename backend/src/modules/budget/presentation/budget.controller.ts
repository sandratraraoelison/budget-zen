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
import { BudgetService } from "../application/budget.service";
import {
  BudgetDto,
  CustomCategoryDto,
  GoalDto,
  TransactionDto,
  UpdateBudgetDto,
  UpdateCustomCategoryDto,
  UpdateGoalDto,
  UpdateTransactionDto,
} from "./budget.dto";

@ApiTags("budget")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class BudgetController {
  constructor(private readonly service: BudgetService) {}
  @Get("budget/summary") summary(@CurrentUser() user: string) {
    return this.service.summary(user);
  }
  @Get("transactions") transactions(@CurrentUser() user: string) {
    return this.service.summary(user).transactions;
  }
  @Post("transactions") addTransaction(
    @CurrentUser() user: string,
    @Body() dto: TransactionDto,
  ) {
    return this.service.addTransaction(user, dto);
  }
  @Patch("transactions/:id") updateTransaction(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.service.updateTransaction(user, id, dto);
  }
  @Delete("transactions/:id") @HttpCode(204) removeTransaction(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    this.service.removeTransaction(user, id);
  }
  @Get("budgets") budgets(@CurrentUser() user: string) {
    return this.service.summary(user).budgets;
  }
  @Post("budgets") addBudget(
    @CurrentUser() user: string,
    @Body() dto: BudgetDto,
  ) {
    return this.service.addBudget(user, dto);
  }
  @Patch("budgets/:id") updateBudget(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.service.updateBudget(user, id, dto);
  }
  @Delete("budgets/:id") @HttpCode(204) removeBudget(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    this.service.removeBudget(user, id);
  }
  @Get("savings-goals") goals(@CurrentUser() user: string) {
    return this.service.summary(user).savingsGoals;
  }
  @Post("savings-goals") addGoal(
    @CurrentUser() user: string,
    @Body() dto: GoalDto,
  ) {
    return this.service.addGoal(user, dto);
  }
  @Patch("savings-goals/:id") updateGoal(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.service.updateGoal(user, id, dto);
  }
  @Delete("savings-goals/:id") @HttpCode(204) removeGoal(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    this.service.removeGoal(user, id);
  }
  @Get("custom-categories") categories(@CurrentUser() user: string) {
    return this.service.summary(user).customCategories;
  }
  @Post("custom-categories") addCategory(
    @CurrentUser() user: string,
    @Body() dto: CustomCategoryDto,
  ) {
    return this.service.addCategory(user, dto);
  }
  @Patch("custom-categories/:id") updateCategory(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomCategoryDto,
  ) {
    return this.service.updateCategory(user, id, dto);
  }
  @Delete("custom-categories/:id") @HttpCode(204) removeCategory(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    this.service.removeCategory(user, id);
  }
  @Post("custom-categories/:id/transactions") addCategoryTransaction(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: TransactionDto,
  ) {
    return this.service.addCategoryTransaction(user, id, dto);
  }
  @Delete("custom-categories/:id/transactions/:transactionId")
  @HttpCode(204)
  removeCategoryTransaction(
    @CurrentUser() user: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("transactionId", ParseUUIDPipe) transactionId: string,
  ) {
    this.service.removeCategoryTransaction(user, id, transactionId);
  }
}
