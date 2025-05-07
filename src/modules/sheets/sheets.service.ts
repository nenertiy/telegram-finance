import { Injectable } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';
import { SPEND_CATEGORIES } from 'src/common/constants/spend-categories';
import { INCOME_CATEGORIES } from 'src/common/constants/income-categories';
import { HEADER_CELLS } from 'src/common/constants/header-cells';
import { INIT_ROW } from 'src/common/constants/init-row';
import { cellFn } from './model/cell-fn';

import * as dayjs from 'dayjs';

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
    const date = dayjs().format('MMMM YYYY');
    const valuesExist =
      sheetData.data &&
      sheetData.data.values &&
      sheetData.data.values.length > 0;
    if (!valuesExist) {
      const headerCells = HEADER_CELLS.map((cell) =>
        cellFn(cell.value, { fontSize: 14, align: 'CENTER' }),
      );

      const categoryRows = [];

      for (let i = 0; i < SPEND_CATEGORIES.length; i++) {
        const category = SPEND_CATEGORIES[i];
        const incomeCategory = INCOME_CATEGORIES[i];

        categoryRows.push({
          values: [
            cellFn(category.name, {
              backgroundColor: this.hexToRgb(category.color),
            }),

            cellFn(`=sumColoredCells(C12:C, A${2 + i})`, {
              backgroundColor: this.hexToRgb('#ea9999'),
              foregroundColor: this.hexToRgb('#991402'),
            }),
            cellFn(`=sumColoredCells(E12:E, A${2 + i})`, {
              backgroundColor: this.hexToRgb('#ea9999'),
              foregroundColor: this.hexToRgb('#991402'),
            }),
            cellFn(`=sumColoredCells(G12:G, A${2 + i})`, {
              backgroundColor: this.hexToRgb('#ea9999'),
              foregroundColor: this.hexToRgb('#991402'),
            }),

            cellFn(`=sumColoredCells(C12:C, H${2 + i})`, {
              backgroundColor: this.hexToRgb('#b6d7a8'),
              foregroundColor: this.hexToRgb('#38761d'),
            }),
            cellFn(`=sumColoredCells(E12:E, H${2 + i})`, {
              backgroundColor: this.hexToRgb('#b6d7a8'),
              foregroundColor: this.hexToRgb('#38761d'),
            }),
            cellFn(`=sumColoredCells(G12:G, H${2 + i})`, {
              backgroundColor: this.hexToRgb('#b6d7a8'),
              foregroundColor: this.hexToRgb('#38761d'),
            }),

            cellFn(incomeCategory?.name || '', {
              backgroundColor: incomeCategory?.color
                ? this.hexToRgb(incomeCategory.color)
                : undefined,
            }),
          ],
        });
      }

      const initRow = INIT_ROW.map((cell) =>
        cellFn(cell.value, { fontSize: 14, align: 'CENTER' }),
      );

      const initialRow = {
        values: [
          cellFn(dayjs().format('DD.MM.YYYY/HH:mm')),
          cellFn(usdAmount),
          cellFn(0),
          cellFn(eurAmount),
          cellFn(0),
          cellFn(rubAmount),
          cellFn(0),
          cellFn('init'),
        ],
      };

      let sheetIdToUse = lastSheet;

      if (sheetName !== date) {
        await this.batchUpdateSheetData({
          requests: [
            {
              addSheet: {
                properties: {
                  title: date,
                },
              },
            },
          ],
        });

        const { lastSheet: newLastSheet } = await this.getSheet();

        sheetIdToUse = newLastSheet;
      }

      const requestBody = {
        requests: [
          {
            appendCells: {
              fields: 'userEnteredValue, userEnteredFormat',
              sheetId: sheetIdToUse,
              rows: [
                { values: headerCells },
                ...categoryRows,
                { values: initRow },
                initialRow,
              ],
            },
          },
        ],
      };

      const init = await this.batchUpdateSheetData(requestBody);
      await this.deleteRange('E6:G10');
      return init;
    }
  }

  async addTransaction(transactionData: {
    currency: string;
    category: string;
    amount: number;
    description?: string;
  }) {
    const { sheetName: oldSheeName } = await this.getSheet();
    const oldSheetData = await this.getSheetData(oldSheeName);

    const dollarValue =
      oldSheetData.data.values[oldSheetData.data.values.length - 1][1];
    const eurValue =
      oldSheetData.data.values[oldSheetData.data.values.length - 1][3];
    const rubValue =
      oldSheetData.data.values[oldSheetData.data.values.length - 1][5];

    await this.checkDateList(dollarValue, eurValue, rubValue);
    const { sheetName, lastSheet } = await this.getSheet();
    const sheetData = await this.getSheetData(sheetName);

    const valuesExist =
      sheetData.data &&
      sheetData.data.values &&
      sheetData.data.values.length > 0;
    const prevRow = valuesExist ? sheetData.data.values.length : 1;
    const thisRow = valuesExist ? sheetData.data.values.length + 1 : 2;

    let color = '#ffffff';
    let isIncome = false;

    if (transactionData.category.startsWith('salary')) {
      color = '#b6d7a8';
      isIncome = true;
    } else if (transactionData.category.startsWith('returns')) {
      color = '#93c47d';
      isIncome = true;
    } else if (transactionData.category.startsWith('gifts')) {
      color = '#6aa84f';
      isIncome = true;
    } else if (transactionData.category.startsWith('savings')) {
      color = '#38761d';
      isIncome = true;
    } else if (transactionData.category.startsWith('food')) {
      color = '#8e7cc3';
    } else if (transactionData.category.startsWith('eating out')) {
      color = '#b4a7d6';
    } else if (transactionData.category.startsWith('public transport')) {
      color = '#d5a6bd';
    } else if (transactionData.category.startsWith('taxi')) {
      color = '#c27ba0';
    } else if (transactionData.category.startsWith('subscription')) {
      color = '#3d85c6';
    } else if (transactionData.category.startsWith('shopping')) {
      color = '#ffe598';
    } else if (transactionData.category.startsWith('chill')) {
      color = '#f9cb9c';
    } else if (transactionData.category.startsWith('travel')) {
      color = '#f6b26b';
    } else {
      color = '#cccccc';
    }

    const amount = isIncome ? transactionData.amount : -transactionData.amount;

    const emoji = isIncome ? '💵' : '💸';

    const currencySymbol =
      transactionData.currency === 'usd'
        ? ' ($)'
        : transactionData.currency === 'eur'
          ? ' (€)'
          : transactionData.currency === 'rub'
            ? ' (₽)'
            : '';

    let description = transactionData.description
      ? `${emoji}${currencySymbol} ${transactionData.description}`
      : `${emoji}${currencySymbol} ${transactionData.category}`;

    const values = [
      cellFn(dayjs().format('DD.MM.YYYY/HH:mm')),

      cellFn(`=B${prevRow}+C${thisRow}`),

      cellFn(transactionData.currency === 'usd' ? amount : 0, {
        backgroundColor:
          transactionData.currency === 'usd' ? this.hexToRgb(color) : undefined,
      }),

      cellFn(`=D${prevRow}+E${thisRow}`),

      cellFn(transactionData.currency === 'eur' ? amount : 0, {
        backgroundColor:
          transactionData.currency === 'eur' ? this.hexToRgb(color) : undefined,
      }),

      cellFn(`=F${prevRow}+G${thisRow}`),

      cellFn(transactionData.currency === 'rub' ? amount : 0, {
        backgroundColor:
          transactionData.currency === 'rub' ? this.hexToRgb(color) : undefined,
      }),

      cellFn(description),
    ];

    const requestBody = {
      requests: [
        {
          appendCells: {
            fields: 'userEnteredValue, userEnteredFormat',
            sheetId: lastSheet,
            rows: [{ values }],
          },
        },
      ],
    };

    return this.batchUpdateSheetData(requestBody);
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

  private async checkDateList(dollarValue, eurValue, rubValue) {
    const { sheetName } = await this.getSheet();
    const date = dayjs().format('MMMM YYYY');

    if (sheetName !== date) {
      try {
        const requestBody = {
          requests: [
            {
              addSheet: {
                properties: {
                  title: date,
                },
              },
            },
          ],
        };

        const response = await this.batchUpdateSheetData(requestBody);

        console.log('Новый лист создан:', date);

        await this.initFinance(dollarValue, eurValue, rubValue);

        return response.data.replies[0].addSheet?.properties;
      } catch (error) {
        console.error('Ошибка при создании листа:', error.message);
        throw error;
      }
    } else {
      console.log('Текущий лист уже актуален:', sheetName);
      return null;
    }
  }
}
