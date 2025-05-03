import { Injectable } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class SheetsService {
  private sheets: any;

  constructor() {
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }
}
