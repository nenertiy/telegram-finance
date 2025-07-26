import { Injectable } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';
import * as dayjs from 'dayjs';
import { SPEND_CATEGORIES } from 'src/common/constants/spend-categories';
import { INCOME_CATEGORIES } from 'src/common/constants/income-categories';
import { HEADER_CELLS } from 'src/common/constants/header-cells';
import { INIT_ROW } from 'src/common/constants/init-row';
import { cellFn } from './model/cell-fn';

@Injectable()
export class SheetsService {
  private auth: JWT;
  private sheets: any;
  private spreadSheetId: string;

  constructor() {
    this.auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets('v4');
    this.spreadSheetId = process.env.GOOGLE_SHEET_ID;
  }

  async initFinance(usdAmount = 0, eurAmount = 0, rubAmount = 0) {
    const { lastSheet, sheetName } = await this.getSheet();
    const sheetData = await this.getSheetData(sheetName);
    const currentDate = dayjs().format('MMMM YYYY');

    if (this.hasValues(sheetData)) return;

    const headerCells = HEADER_CELLS.map((cell) =>
      cellFn(cell.value, { fontSize: 14, align: 'CENTER' }),
    );
    const categoryRows = this.generateCategoryRows();

    const allRow = this.generateAllRow();

    const initRow = INIT_ROW.map((cell) =>
      cellFn(cell.value, { fontSize: 14, align: 'CENTER' }),
    );

    const initialRow = {
      values: [
        cellFn(dayjs().format('DD.MM.YYYY/HH:mm'), { align: 'LEFT' }),
        cellFn(usdAmount),
        cellFn(0),
        cellFn(eurAmount),
        cellFn(0),
        cellFn(rubAmount),
        cellFn(0),
        cellFn('init', { align: 'LEFT' }),
      ],
    };

    let sheetIdToUse = lastSheet;

    if (sheetName !== currentDate) {
      await this.batchUpdateSheetData({
        requests: [{ addSheet: { properties: { title: currentDate } } }],
      });
      const { lastSheet: newLastSheet } = await this.getSheet();
      sheetIdToUse = newLastSheet;
    }

    await this.batchUpdateSheetData({
      requests: [
        {
          appendCells: {
            fields: 'userEnteredValue, userEnteredFormat',
            sheetId: sheetIdToUse,
            rows: [
              { values: headerCells },
              ...categoryRows,
              allRow,
              { values: initRow },
              initialRow,
            ],
          },
        },
      ],
    });

    await this.deleteRange('E9:G10');
  }

  async addTransaction({
    currency,
    category,
    amount,
    description,
  }: {
    currency: string;
    category: string;
    amount: number;
    description?: string;
  }) {
    const { sheetName: oldSheetName } = await this.getSheet();
    const oldSheetData = await this.getSheetData(oldSheetName);
    const lastRow = oldSheetData.data.values.at(-1) ?? [];
    const [dollarValue, eurValue, rubValue] = [
      lastRow[1],
      lastRow[3],
      lastRow[5],
    ];

    await this.checkDateList(dollarValue, eurValue, rubValue);

    const { sheetName, lastSheet } = await this.getSheet();
    const sheetData = await this.getSheetData(sheetName);

    const prevRow = sheetData.data.values.length || 1;
    const thisRow = prevRow + 1;

    const { isIncome, color } = this.getCategoryStyle(category);
    const formattedAmount = isIncome ? amount : -amount;
    const emoji = isIncome ? '💵' : '💸';
    const currencySymbol =
      { usd: '($)', eur: '(€)', rub: '(₽)' }[currency] || '';

    const finalDescription = description || category || 'Без категории';

    const values = [
      cellFn(dayjs().format('DD.MM.YYYY/HH:mm'), { align: 'LEFT' }),
      cellFn(`=B${prevRow}+C${thisRow}`),
      cellFn(currency === 'usd' ? formattedAmount : 0, {
        backgroundColor: currency === 'usd' ? this.hexToRgb(color) : undefined,
      }),
      cellFn(`=D${prevRow}+E${thisRow}`),
      cellFn(currency === 'eur' ? formattedAmount : 0, {
        backgroundColor: currency === 'eur' ? this.hexToRgb(color) : undefined,
      }),
      cellFn(`=F${prevRow}+G${thisRow}`),
      cellFn(currency === 'rub' ? formattedAmount : 0, {
        backgroundColor: currency === 'rub' ? this.hexToRgb(color) : undefined,
      }),
      cellFn(`${emoji} ${currencySymbol} ${finalDescription}`, {
        align: 'LEFT',
      }),
    ];

    return this.batchUpdateSheetData({
      requests: [
        {
          appendCells: {
            fields: 'userEnteredValue, userEnteredFormat',
            sheetId: lastSheet,
            rows: [{ values }],
          },
        },
      ],
    });
  }

  private hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          red: parseInt(result[1], 16) / 255,
          green: parseInt(result[2], 16) / 255,
          blue: parseInt(result[3], 16) / 255,
        }
      : { red: 1, green: 1, blue: 1 };
  }

  private async getSheet() {
    const response = await this.sheets.spreadsheets.get({
      auth: this.auth,
      spreadsheetId: this.spreadSheetId,
    });

    const lastSheet =
      response.data.sheets[response.data.sheets.length - 1].properties.sheetId;
    const sheetName =
      response.data.sheets[response.data.sheets.length - 1].properties.title;

    return { lastSheet, sheetName };
  }

  private async getSheetData(sheetName: string) {
    return this.sheets.spreadsheets.values.get({
      auth: this.auth,
      spreadsheetId: this.spreadSheetId,
      range: sheetName + '!A:Z',
    });
  }

  private async batchUpdateSheetData(requestBody: object) {
    return this.sheets.spreadsheets.batchUpdate({
      auth: this.auth,
      spreadsheetId: this.spreadSheetId,
      requestBody: requestBody,
    });
  }

  private async deleteRange(range: string) {
    const { lastSheet } = await this.getSheet();

    const [startCell, endCell] = range.split(':');
    const startColumn = startCell.charCodeAt(0) - 65;
    const startRow = parseInt(startCell.substring(1)) - 1;
    const endColumn = endCell.charCodeAt(0) - 65;
    const endRow = parseInt(endCell.substring(1)) - 1;

    const requestBody = {
      requests: [
        {
          deleteRange: {
            range: {
              sheetId: lastSheet,
              startRowIndex: startRow,
              endRowIndex: endRow + 1,
              startColumnIndex: startColumn,
              endColumnIndex: endColumn + 1,
            },
            shiftDimension: 'COLUMNS',
          },
        },
      ],
    };

    return this.batchUpdateSheetData(requestBody);
  }

  private async checkDateList(
    dollarValue: number,
    eurValue: number,
    rubValue: number,
  ) {
    const { sheetName } = await this.getSheet();
    const currentDate = dayjs().format('MMMM YYYY');

    if (sheetName === currentDate) {
      console.log('Текущий лист уже актуален:', sheetName);
      return null;
    }

    try {
      const response = await this.batchUpdateSheetData({
        requests: [{ addSheet: { properties: { title: currentDate } } }],
      });

      console.log('Новый лист создан:', currentDate);
      await this.initFinance(dollarValue, eurValue, rubValue);

      return response.data.replies[0].addSheet?.properties;
    } catch (error) {
      console.error('Ошибка при создании листа:', error.message);
      throw error;
    }
  }

  private hasValues(sheetData: any): boolean {
    return !!sheetData.data?.values?.length;
  }

  private generateCategoryRows() {
    return SPEND_CATEGORIES.map((category, i) => {
      const incomeCategory = INCOME_CATEGORIES[i];
      return {
        values: [
          cellFn(category.name, {
            backgroundColor: this.hexToRgb(category.color),
            align: 'LEFT',
          }),
          ...['C', 'E', 'G'].map((col) =>
            cellFn(`=sumColoredCells(${col}13:${col}, A${2 + i})`, {
              backgroundColor: this.hexToRgb('#ea9999'),
              foregroundColor: this.hexToRgb('#991402'),
            }),
          ),
          ...['C', 'E', 'G'].map((col) =>
            cellFn(`=sumColoredCells(${col}13:${col}, H${2 + i})`, {
              backgroundColor: this.hexToRgb('#b6d7a8'),
              foregroundColor: this.hexToRgb('#38761d'),
            }),
          ),
          cellFn(incomeCategory?.name || '', {
            backgroundColor: incomeCategory?.color
              ? this.hexToRgb(incomeCategory.color)
              : undefined,
          }),
        ],
      };
    });
  }

  private generateAllRow() {
    return {
      values: [
        cellFn('all', {
          align: 'LEFT',
          backgroundColor: this.hexToRgb('#ea9999'),
        }),
        cellFn('=SUM(B2:B10)', {
          backgroundColor: this.hexToRgb('#ea9999'),
          foregroundColor: this.hexToRgb('#991402'),
        }),
        cellFn('=SUM(C2:C10)', {
          backgroundColor: this.hexToRgb('#ea9999'),
          foregroundColor: this.hexToRgb('#991402'),
        }),
        cellFn('=SUM(D2:D10)', {
          backgroundColor: this.hexToRgb('#ea9999'),
          foregroundColor: this.hexToRgb('#991402'),
        }),
        cellFn('=SUM(E2:E10)', {
          backgroundColor: this.hexToRgb('#b6d7a8'),
          foregroundColor: this.hexToRgb('#38761d'),
        }),
        cellFn('=SUM(F2:F10)', {
          backgroundColor: this.hexToRgb('#b6d7a8'),
          foregroundColor: this.hexToRgb('#38761d'),
        }),
        cellFn('=SUM(G2:G10)', {
          backgroundColor: this.hexToRgb('#b6d7a8'),
          foregroundColor: this.hexToRgb('#38761d'),
        }),
        cellFn('all', {
          align: 'RIGHT',
          backgroundColor: this.hexToRgb('#b6d7a8'),
        }),
      ],
    };
  }

  private getCategoryStyle(category: string) {
    const lower = category.toLowerCase();
    const mapping = [
      { prefix: 'other expenses', color: '#cccccc', income: false },
      { prefix: 'other income', color: '#d3e7ca', income: true },
      { prefix: 'sell', color: '#accb9e', income: true },
      { prefix: 'salary', color: '#b6d7a8', income: true },
      { prefix: 'family', color: '#99C785', income: true },
      { prefix: 'returns', color: '#7BB762', income: true },
      { prefix: 'gifts', color: '#629E48', income: true },
      { prefix: 'savings', color: '#4C7B38', income: true },
      { prefix: 'food', color: '#8e7cc3' },
      { prefix: 'eating out', color: '#b4a7d6' },
      { prefix: 'public transport', color: '#d5a6bd' },
      { prefix: 'taxi', color: '#c27ba0' },
      { prefix: 'subscription', color: '#3d85c6' },
      { prefix: 'shopping', color: '#ffe598' },
      { prefix: 'chill', color: '#f9cb9c' },
      { prefix: 'travel', color: '#f6b26b' },
    ];

    const match = mapping.find(({ prefix }) => lower.startsWith(prefix));
    return match
      ? { color: match.color, isIncome: match.income || false }
      : { color: '#cccccc', isIncome: false };
  }
}
