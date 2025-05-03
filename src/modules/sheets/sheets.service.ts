import { Injectable } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';
import * as dayjs from 'dayjs';

@Injectable()
export class SheetsService {
  private auth: JWT;
  private sheets: any;
  private spreadSheetId: string;

  constructor() {
    this.auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets('v4');
    this.spreadSheetId = process.env.GOOGLE_SHEET_ID;
  }

  async initFinance(usdAmount = 0, eurAmount = 0, rubAmount = 0) {
    const { lastSheet, sheetName } = await this.getSheet();
    const sheetData = await this.getSheetData(sheetName);
    const valuesExist =
      sheetData.data &&
      sheetData.data.values &&
      sheetData.data.values.length > 0;
    if (!valuesExist) {
      // Создаем заголовки и категории как на изображении
      const spendCategories = [
        { name: 'no category', color: '#cccccc' },
        { name: 'food', color: '#8e7cc3' },
        { name: 'eating out', color: '#b4a7d6' },
        { name: 'public transport', color: '#d5a6bd' },
        { name: 'taxi', color: '#c27ba0' },
        { name: 'subscription', color: '#3d85c6' },
        { name: 'shopping', color: '#ffe598' },
        { name: 'chill', color: '#f9cb9c' },
        { name: 'travel', color: '#f6b26b' },
      ];

      const incomeCategories = [
        { name: 'salary', color: '#b6d7a8' },
        { name: 'returns', color: '#b6d7a8' },
        { name: 'gifts', color: '#b6d7a8' },
        { name: 'savings', color: '#b6d7a8' },
      ];

      const headerCells = [
        {
          userEnteredValue: { stringValue: 'Spends' },
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14 },
            horizontalAlignment: 'CENTER',
          },
        },
        {
          userEnteredValue: { stringValue: '$' },
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14 },
            horizontalAlignment: 'CENTER',
          },
        },
        {
          userEnteredValue: { stringValue: '€' },
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14 },
            horizontalAlignment: 'CENTER',
          },
        },
        {
          userEnteredValue: { stringValue: '₽' },
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14 },
            horizontalAlignment: 'CENTER',
          },
        },
        {
          userEnteredValue: { stringValue: '$' },
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14 },
            horizontalAlignment: 'CENTER',
          },
        },
        {
          userEnteredValue: { stringValue: '€' },
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14 },
            horizontalAlignment: 'CENTER',
          },
        },
        {
          userEnteredValue: { stringValue: '₽' },
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14 },
            horizontalAlignment: 'CENTER',
          },
        },
        {
          userEnteredValue: { stringValue: 'Income' },
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14 },
            horizontalAlignment: 'CENTER',
          },
        },
      ];

      const categoryRows = [];

      for (let i = 0; i < spendCategories.length; i++) {
        const category = spendCategories[i];
        categoryRows.push({
          values: [
            {
              userEnteredValue: { stringValue: category.name },
              userEnteredFormat: {
                backgroundColor: this.hexToRgb(category.color),
                textFormat: { fontSize: 12 },
              },
            },
            {
              userEnteredValue: { formulaValue: '#NAME?' },
              userEnteredFormat: {
                textFormat: { fontSize: 12 },
              },
            },
            {
              userEnteredValue: { formulaValue: '#NAME?' },
              userEnteredFormat: {
                textFormat: { fontSize: 12 },
              },
            },
            {
              userEnteredValue: { stringValue: '' },
              userEnteredFormat: {
                textFormat: { fontSize: 12 },
              },
            },
            {
              userEnteredValue: { stringValue: '' },
              userEnteredFormat: {
                textFormat: { fontSize: 12 },
              },
            },
            {
              userEnteredValue: { stringValue: '' },
              userEnteredFormat: {
                textFormat: { fontSize: 12 },
              },
            },
            {
              userEnteredValue: { formulaValue: '#NAME?' },
              userEnteredFormat: {
                textFormat: { fontSize: 12 },
              },
            },
            i < incomeCategories.length
              ? {
                  userEnteredValue: { stringValue: incomeCategories[i].name },
                  userEnteredFormat: {
                    backgroundColor: this.hexToRgb(incomeCategories[i].color),
                    textFormat: { fontSize: 12 },
                  },
                }
              : { userEnteredValue: { stringValue: '' } },
          ],
        });
      }

      const initRow = {
        values: [
          {
            userEnteredValue: { stringValue: 'Date' },
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 14 },
              horizontalAlignment: 'CENTER',
            },
          },
          {
            userEnteredValue: { stringValue: '$' },
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 14 },
              horizontalAlignment: 'CENTER',
            },
          },
          {
            userEnteredValue: { stringValue: '$' },
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 14 },
              horizontalAlignment: 'CENTER',
            },
          },
          {
            userEnteredValue: { stringValue: '€' },
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 14 },
              horizontalAlignment: 'CENTER',
            },
          },
          {
            userEnteredValue: { stringValue: '€' },
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 14 },
              horizontalAlignment: 'CENTER',
            },
          },
          {
            userEnteredValue: { stringValue: '₽' },
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 14 },
              horizontalAlignment: 'CENTER',
            },
          },
          {
            userEnteredValue: { stringValue: '₽' },
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 14 },
              horizontalAlignment: 'CENTER',
            },
          },
          {
            userEnteredValue: { stringValue: 'Description' },
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 14 },
              horizontalAlignment: 'CENTER',
            },
          },
        ],
      };

      const initialRow = {
        values: [
          {
            userEnteredValue: {
              stringValue: dayjs().format('DD.MM.YYYY/HH:mm'),
            },
            userEnteredFormat: {
              textFormat: { fontSize: 12 },
            },
          },
          {
            userEnteredValue: { numberValue: usdAmount },
            userEnteredFormat: {
              textFormat: { fontSize: 12 },
            },
          },

          {
            userEnteredValue: { numberValue: 0 },
            userEnteredFormat: {
              textFormat: { fontSize: 12 },
            },
          },
          {
            userEnteredValue: { numberValue: eurAmount },
            userEnteredFormat: {
              textFormat: { fontSize: 12 },
            },
          },
          {
            userEnteredValue: { numberValue: 0 },
            userEnteredFormat: {
              textFormat: { fontSize: 12 },
            },
          },
          {
            userEnteredValue: { numberValue: rubAmount },
            userEnteredFormat: {
              textFormat: { fontSize: 12 },
            },
          },
          {
            userEnteredValue: { numberValue: 0 },
            userEnteredFormat: {
              textFormat: { fontSize: 12 },
            },
          },
          {
            userEnteredValue: { stringValue: 'init' },
            userEnteredFormat: {
              textFormat: { fontSize: 12 },
            },
          },
        ],
      };

      const requestBody = {
        requests: [
          {
            appendCells: {
              fields: 'userEnteredValue, userEnteredFormat',
              sheetId: lastSheet,
              rows: [
                { values: headerCells },
                ...categoryRows,
                initRow,
                initialRow,
              ],
            },
          },
        ],
      };

      return this.batchUpdateSheetData(requestBody);
    }
  }

  async addTransaction(transactionData: {
    currency: string;
    category: string;
    amount: number;
    description?: string;
  }) {
    const { lastSheet, sheetName } = await this.getSheet();
    const sheetData = await this.getSheetData(sheetName);

    const valuesExist =
      sheetData.data &&
      sheetData.data.values &&
      sheetData.data.values.length > 0;
    const prevRow = valuesExist ? sheetData.data.values.length : 1;
    const thisRow = valuesExist ? sheetData.data.values.length + 1 : 2;

    let color = '#ffffff';
    let isIncome = false;

    if (
      transactionData.category.startsWith('salary') ||
      transactionData.category.startsWith('returns') ||
      transactionData.category.startsWith('savings') ||
      transactionData.category.startsWith('gifts')
    ) {
      color = '#b6d7a8';
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
      {
        userEnteredValue: {
          stringValue: dayjs().format('DD.MM.YYYY/HH:mm'),
        },
        userEnteredFormat: {
          textFormat: { fontSize: 12 },
        },
      },
      // Формула для суммирования USD
      {
        userEnteredValue: {
          formulaValue: `=B${prevRow}+C${thisRow}`,
        },
        userEnteredFormat: {
          textFormat: { fontSize: 12 },
        },
      },
      {
        userEnteredFormat:
          transactionData.currency === 'usd'
            ? {
                backgroundColor: {
                  red: this.hexToRgb(color).red,
                  green: this.hexToRgb(color).green,
                  blue: this.hexToRgb(color).blue,
                },
                textFormat: { fontSize: 12 },
              }
            : { textFormat: { fontSize: 12 } },
        userEnteredValue: {
          numberValue: transactionData.currency === 'usd' ? amount : 0,
        },
      },
      {
        userEnteredValue: {
          formulaValue: `=D${prevRow}+E${thisRow}`,
        },
        userEnteredFormat: {
          textFormat: { fontSize: 12 },
        },
      },
      {
        userEnteredFormat:
          transactionData.currency === 'eur'
            ? {
                backgroundColor: {
                  red: this.hexToRgb(color).red,
                  green: this.hexToRgb(color).green,
                  blue: this.hexToRgb(color).blue,
                },
                textFormat: { fontSize: 12 },
              }
            : { textFormat: { fontSize: 12 } },
        userEnteredValue: {
          numberValue: transactionData.currency === 'eur' ? amount : 0,
        },
      },
      {
        userEnteredValue: {
          formulaValue: `=F${prevRow}+G${thisRow}`,
        },
        userEnteredFormat: {
          textFormat: { fontSize: 12 },
        },
      },
      {
        userEnteredFormat:
          transactionData.currency === 'rub'
            ? {
                backgroundColor: {
                  red: this.hexToRgb(color).red,
                  green: this.hexToRgb(color).green,
                  blue: this.hexToRgb(color).blue,
                },
                textFormat: { fontSize: 12 },
              }
            : { textFormat: { fontSize: 12 } },
        userEnteredValue: {
          numberValue: transactionData.currency === 'rub' ? amount : 0,
        },
      },
      {
        userEnteredValue: {
          stringValue: description,
        },
        userEnteredFormat: {
          textFormat: { fontSize: 12 },
        },
      },
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
}
