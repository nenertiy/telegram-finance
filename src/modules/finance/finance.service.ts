import { Injectable } from '@nestjs/common';
import { SheetsService } from '../sheets/sheets.service';
import {
  TransactionData,
  CategorySummary,
  FinanceData,
  CurrencySummary,
  TransactionHistoryResponse,
} from './interfaces/finance.interface';

@Injectable()
export class FinanceService {
  constructor(private readonly sheetsService: SheetsService) {}

  async getFinanceData(sheetName: string): Promise<FinanceData> {
    const sheetData = await this.sheetsService.getSheetData(sheetName);
    const sheetDataWithFormatting =
      await this.sheetsService.getSheetDataWithFormatting(sheetName);
    const values = sheetData.data.values;
    const formattedData =
      sheetDataWithFormatting.data.sheets[0].data[0].rowData;

    if (!values || values.length < 12) {
      throw new Error('Недостаточно данных в таблице');
    }

    // Парсим итоговую строку "all" (строка 10)
    const allRow = values[10];
    const lastRow = values[values.length - 1];
    const summary = {
      totalUsdExpenses: parseFloat(allRow[1]) || 0,
      totalEurExpenses: parseFloat(allRow[2]) || 0,
      totalRubExpenses: parseFloat(allRow[3]) || 0,
      totalUsdIncome: parseFloat(allRow[4]) || 0,
      totalEurIncome: parseFloat(allRow[5]) || 0,
      totalRubIncome: parseFloat(allRow[6]) || 0,
      currentUsdBalance: parseFloat(lastRow[1]) || 0,
      currentEurBalance: parseFloat(lastRow[3]) || 0,
      currentRubBalance: parseFloat(lastRow[5]) || 0,
    };

    // Парсим категории (строки 1-9)
    const categories: CategorySummary[] = [];
    for (let i = 1; i <= 9; i++) {
      const row = values[i];
      if (row) {
        // Добавляем категорию расходов, если name не пустое
        if (row[0] && row[0].trim() !== '') {
          const { color } = this.sheetsService.getCategoryStyle(row[0]);
          categories.push({
            name: row[0],
            usd: parseFloat(row[1]) || 0,
            eur: parseFloat(row[2]) || 0,
            rub: parseFloat(row[3]) || 0,
            color,
          });
        }

        // Добавляем категорию доходов, если name не пустое
        if (row[7] && row[7].trim() !== '') {
          const { color } = this.sheetsService.getCategoryStyle(row[7]);
          categories.push({
            name: row[7],
            usd: parseFloat(row[4]) || 0,
            eur: parseFloat(row[5]) || 0,
            rub: parseFloat(row[6]) || 0,
            color,
          });
        }
      }
    }

    // Парсим транзакции (строки 12+)
    const transactions: TransactionData[] = [];
    for (let i = 12; i < values.length; i++) {
      const row = values[i];
      const formattedRow = formattedData[i]?.values;

      if (row && row[0] && row[0] !== 'Data') {
        const usdChange = parseFloat(row[2]) || 0;
        const eurChange = parseFloat(row[4]) || 0;
        const rubChange = parseFloat(row[6]) || 0;
        const description = row[7] || '';

        let category = '';

        if (description.includes('init')) {
          category = 'init';
        } else {
          let cellColor = null;

          if (
            usdChange !== 0 &&
            formattedRow &&
            formattedRow[2]?.effectiveFormat?.backgroundColor
          ) {
            cellColor = formattedRow[2].effectiveFormat.backgroundColor;
          } else if (
            eurChange !== 0 &&
            formattedRow &&
            formattedRow[4]?.effectiveFormat?.backgroundColor
          ) {
            cellColor = formattedRow[4].effectiveFormat.backgroundColor;
          } else if (
            rubChange !== 0 &&
            formattedRow &&
            formattedRow[6]?.effectiveFormat?.backgroundColor
          ) {
            cellColor = formattedRow[6].effectiveFormat.backgroundColor;
          }

          if (cellColor) {
            category = this.sheetsService.getCategoryByColor(cellColor);
          } else {
            const parts = description.split(') ');
            category = parts[1] || 'unknown';
          }
        }

        const isIncome = description.includes('💵');
        const type = isIncome ? 'income' : 'expense';

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

    transactions.sort(
      (a, b) =>
        this.parseDate(b.date).getTime() - this.parseDate(a.date).getTime(),
    );

    return {
      summary,
      categories,
      transactions,
    };
  }

  async getTransactionHistory(
    sheetName: string,
    currency?: 'usd' | 'eur' | 'rub',
    skip?: number,
    take?: number,
  ): Promise<TransactionHistoryResponse> {
    const data = await this.getFinanceData(sheetName);
    let filteredTransactions = data.transactions.filter(
      (t) => t.category !== 'init',
    );

    if (currency) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t[currency] !== undefined,
      );
    }

    filteredTransactions.sort(
      (a, b) =>
        this.parseDate(b.date).getTime() - this.parseDate(a.date).getTime(),
    );

    const totalSize = filteredTransactions.length;

    const skipValue = Number(skip) || 0;
    const takeValue = Number(take) || 10;

    const paginatedTransactions = filteredTransactions.slice(
      skipValue,
      skipValue + takeValue,
    );

    return {
      transactions: paginatedTransactions,
      totalSize,
      skip: skipValue,
      take: takeValue,
    };
  }

  async getSummaryByCurrency(
    sheetName: string,
    currency?: 'usd' | 'eur' | 'rub',
  ): Promise<CurrencySummary> {
    const data = await this.getFinanceData(sheetName);

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
    sheetName: string,
    currency?: 'usd' | 'eur' | 'rub',
  ): Promise<CategorySummary[]> {
    const data = await this.getFinanceData(sheetName);

    let filteredCategories = data.categories.filter((c) => c.name !== 'all');

    if (currency) {
      filteredCategories = filteredCategories.map((c) => ({
        name: c.name,
        [currency]: c[currency],
        color: c.color,
      }));
    }

    return filteredCategories;
  }

  async getSheetNames(): Promise<string[]> {
    const { sheets } = await this.sheetsService.getSheet();
    return sheets.map((sheet) => sheet.properties.title);
  }

  private parseDate(dateString: string): Date {
    const [datePart, timePart] = dateString.split('/');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hours, minutes);
  }
}
