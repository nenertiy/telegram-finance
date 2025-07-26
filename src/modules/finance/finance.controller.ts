import { Controller, Get, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get finance overview' })
  async getFinanceOverview() {
    return this.financeService.getFinanceData();
  }

  @Get('balances')
  @ApiOperation({ summary: 'Get balances' })
  @ApiQuery({
    name: 'currency',
    type: String,
    required: false,
    enum: ['usd', 'eur', 'rub'],
  })
  async getBalances(@Query('currency') currency: 'usd' | 'eur' | 'rub') {
    return this.financeService.getSummaryByCurrency(currency);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiQuery({
    name: 'currency',
    type: String,
    required: false,
    enum: ['usd', 'eur', 'rub'],
  })
  async getTransactionHistory(
    @Query('currency') currency: 'usd' | 'eur' | 'rub',
  ) {
    return this.financeService.getTransactionHistory(currency);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get category summary' })
  @ApiQuery({
    name: 'currency',
    type: String,
    required: false,
    enum: ['usd', 'eur', 'rub'],
  })
  async getCategorySummary(@Query('currency') currency: 'usd' | 'eur' | 'rub') {
    return this.financeService.getCategorySummary(currency);
  }
}
