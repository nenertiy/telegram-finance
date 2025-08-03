import { Controller, Get, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get finance overview' })
  async getFinanceOverview(@Query('sheetName') sheetName: string) {
    return this.financeService.getFinanceData(sheetName);
  }

  @Get('balances')
  @ApiOperation({ summary: 'Get balances' })
  @ApiQuery({
    name: 'currency',
    type: String,
    required: false,
    enum: ['usd', 'eur', 'rub'],
  })
  @ApiQuery({
    name: 'sheetName',
    type: String,
    required: true,
  })
  async getBalances(
    @Query('sheetName') sheetName: string,
    @Query('currency') currency?: 'usd' | 'eur' | 'rub',
  ) {
    return this.financeService.getSummaryByCurrency(sheetName, currency);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiQuery({
    name: 'currency',
    type: String,
    required: false,
    enum: ['usd', 'eur', 'rub'],
  })
  @ApiQuery({
    name: 'sheetName',
    type: String,
    required: true,
  })
  async getTransactionHistory(
    @Query('sheetName') sheetName: string,
    @Query('currency') currency?: 'usd' | 'eur' | 'rub',
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 50,
  ) {
    return this.financeService.getTransactionHistory(
      sheetName,
      currency,
      skip,
      take,
    );
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get category summary' })
  @ApiQuery({
    name: 'currency',
    type: String,
    required: false,
    enum: ['usd', 'eur', 'rub'],
  })
  @ApiQuery({
    name: 'sheetName',
    type: String,
    required: true,
  })
  async getCategorySummary(
    @Query('sheetName') sheetName: string,
    @Query('currency') currency?: 'usd' | 'eur' | 'rub',
  ) {
    return this.financeService.getCategorySummary(sheetName, currency);
  }

  @Get('sheet-names')
  @ApiOperation({ summary: 'Get sheet names' })
  async getSheetNames() {
    return this.financeService.getSheetNames();
  }
}
