import { Injectable } from '@nestjs/common';
import { SheetsService } from '../sheets/sheets.service';
import {
  TransactionData,
  CategorySummary,
  FinanceData,
  CurrencySummary,
} from './interfaces/finance.interface';

@Injectable()
export class FinanceService {
  constructor(private readonly sheetsService: SheetsService) {}

  async getFinanceData(): Promise<FinanceData> {
    const { sheetName } = await this.sheetsService.getSheet();
    const sheetData = await this.sheetsService.getSheetData(sheetName);
    const values = sheetData.data.values;

    if (!values || values.length < 12) {
      throw new Error('Недостаточно данных в таблице');
    }

    // Парсим итоговую строку "all" (строка 10)
    const allRow = values[10];
    const summary = {
      totalUsdExpenses: Math.abs(parseFloat(allRow[1]) || 0),
      totalEurExpenses: Math.abs(parseFloat(allRow[2]) || 0),
      totalRubExpenses: Math.abs(parseFloat(allRow[3]) || 0),
      totalUsdIncome: Math.abs(parseFloat(allRow[4]) || 0),
      totalEurIncome: Math.abs(parseFloat(allRow[5]) || 0),
      totalRubIncome: Math.abs(parseFloat(allRow[6]) || 0),
      currentUsdBalance: 0,
      currentEurBalance: 0,
      currentRubBalance: 0,
    };

    // Парсим категории (строки 1-9)
    const categories: CategorySummary[] = [];
    for (let i = 1; i <= 9; i++) {
      const row = values[i];
      if (row) {
        // Добавляем категорию расходов, если name не пустое
        if (row[0] && row[0].trim() !== '') {
          categories.push({
            name: row[0],
            usd: Math.abs(parseFloat(row[1]) || 0),
            eur: Math.abs(parseFloat(row[2]) || 0),
            rub: Math.abs(parseFloat(row[3]) || 0),
          });
        }

        // Добавляем категорию доходов, если name не пустое
        if (row[7] && row[7].trim() !== '') {
          categories.push({
            name: row[7],
            usd: Math.abs(parseFloat(row[4]) || 0),
            eur: Math.abs(parseFloat(row[5]) || 0),
            rub: Math.abs(parseFloat(row[6]) || 0),
          });
        }
      }
    }

    // Парсим транзакции (строки 12+)
    const transactions: TransactionData[] = [];
    for (let i = 12; i < values.length; i++) {
      const row = values[i];
      if (row && row[0] && row[0] !== 'Data') {
        const usdChange = parseFloat(row[2]) || 0;
        const eurChange = parseFloat(row[4]) || 0;
        const rubChange = parseFloat(row[6]) || 0;
        const description = row[7] || '';

        // Определяем тип и категорию из описания
        const isIncome = description.includes('💵');
        const type = isIncome ? 'income' : 'expense';

        // Извлекаем категорию из описания
        let category = '';
        if (description.includes('init')) {
          category = 'init';
        } else {
          const parts = description.split(') ');
          category = parts[1] || 'unknown';
        }

        transactions.push({
          date: row[0],
          usd: usdChange === 0 ? undefined : usdChange,
          eur: eurChange === 0 ? undefined : eurChange,
          rub: rubChange === 0 ? undefined : rubChange,
          description,
          type,
          category,
        });
      }
    }

    return {
      summary,
      categories,
      transactions,
    };
  }

  async getTransactionHistory(
    currency?: 'usd' | 'eur' | 'rub',
  ): Promise<TransactionData[]> {
    const data = await this.getFinanceData();
    let filteredTransactions = data.transactions.filter(
      (t) => t.category !== 'init',
    );

    if (currency) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t[currency] !== undefined,
      );
    }

    return filteredTransactions;
  }

  async getSummaryByCurrency(
    currency?: 'usd' | 'eur' | 'rub',
  ): Promise<CurrencySummary> {
    const data = await this.getFinanceData();
    if (currency) {
      const capitalizedCurrency =
        currency.charAt(0).toUpperCase() + currency.slice(1).toLowerCase();
      return {
        [currency]: {
          expenses: data.summary[`total${capitalizedCurrency}Expenses`],
          income: data.summary[`total${capitalizedCurrency}Income`],
          balance: data.summary[`current${capitalizedCurrency}Balance`],
        },
      };
    }

    return {
      usd: {
        expenses: data.summary.totalUsdExpenses,
        income: data.summary.totalUsdIncome,
        balance: data.summary.currentUsdBalance,
      },
      eur: {
        expenses: data.summary.totalEurExpenses,
        income: data.summary.totalEurIncome,
        balance: data.summary.currentEurBalance,
      },
      rub: {
        expenses: data.summary.totalRubExpenses,
        income: data.summary.totalRubIncome,
        balance: data.summary.currentRubBalance,
      },
    };
  }

  async getCategorySummary(
    currency?: 'usd' | 'eur' | 'rub',
  ): Promise<CategorySummary[]> {
    const data = await this.getFinanceData();

    let filteredCategories = data.categories.filter((c) => c.name !== 'all');

    if (currency) {
      filteredCategories = filteredCategories.map((c) => ({
        name: c.name,
        [currency]: c[currency],
      }));
    }

    return filteredCategories;
  }
}
