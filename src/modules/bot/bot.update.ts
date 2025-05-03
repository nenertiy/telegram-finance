import { Update, Start, Ctx, On, Action, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    return this.botService.onStart(ctx);
  }

  @Command('add')
  async onAdd(@Ctx() ctx: Context) {
    return this.botService.onAdd(ctx);
  }
}
