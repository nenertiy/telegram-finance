import { Update, Start, Ctx, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';
import { actionButtons } from './bot.buttons';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    return this.botService.onStart(ctx);
    await ctx.reply('Send me a message', actionButtons());
  }

  @Action('button1')
  async onButton1(@Ctx() ctx: Context) {
    await ctx.reply('Button 1 clicked');
  }
}
