import { Injectable } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

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

  async addSheetData(newCellData: string) {
    const { lastSheet, sheetName } = await this.getSheet();
    const sheetData = await this.getSheetData(sheetName);
    // console.log(sheetData);

    const prewRow = sheetData.data.values.length;
    // console.log('prewRow: ', prewRow);
    const thisRow = sheetData.data.values.length + 1;
    // console.log('thisRow: ', thisRow);
    const lastRow = sheetData.data.values[sheetData.data.values.length - 1];
    // console.log('lastRow: ', lastRow);

    const requestBody = {
      requests: [
        {
          appendCells: {
            fields: 'userEnteredValue, userEnteredFormat',
            sheetId: lastSheet,
            rows: [
              {
                values: [
                  {
                    userEnteredValue: {
                      stringValue: newCellData,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    return this.batchUpdateSheetData(requestBody);
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
    this.sheets.spreadsheets.values.batchUpdate({
      auth: this.auth,
      spreadsheetId: this.spreadSheetId,
      requestBody: requestBody,
    });
  }
}
