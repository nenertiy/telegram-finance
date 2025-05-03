import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessMiddleware } from 'src/common/middlewares/access.middleware';
import { SheetsModule } from '../sheets/sheets.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
        middlewares: [AccessMiddleware(configService)],
      }),
    }),
    SheetsModule,
  ],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
