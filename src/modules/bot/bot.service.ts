import { SheetsService } from './../sheets/sheets.service';
import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { categoryButtons, moneyButtons } from './bot.buttons';

@Injectable()
export class BotService {
  constructor(private readonly sheetsService: SheetsService) {}

  async onStart(ctx: Context) {
    await ctx.reply('Welcome!');
  }

  async onAdd(ctx: Context) {
    await ctx.reply('Whose ', moneyButtons());
  }
}
