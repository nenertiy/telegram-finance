import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from 'src/modules/bot/bot.module';
import { FinanceModule } from 'src/modules/finance/finance.module';
import config from 'src/config/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    BotModule,
    FinanceModule,
  ],
})
export class AppModule {}
