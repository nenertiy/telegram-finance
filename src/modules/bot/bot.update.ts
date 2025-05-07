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

  @Command('init')
  async onInit(@Ctx() ctx: Context) {
    return this.botService.onInit(ctx);
  }

  @Command('add')
  async onAdd(@Ctx() ctx: Context) {
    return this.botService.onAdd(ctx);
  }

  @Command('clear')
  async onClear(@Ctx() ctx: Context) {
    return this.botService.onClear(ctx);
  }

  @Action(['rub', 'usd', 'eur'])
  async onCurrencyAction(@Ctx() ctx: Context<any>) {
    const currency = ctx.callbackQuery.data;
    await ctx.answerCbQuery();
    return this.botService.handleCurrencySelection(ctx, currency);
  }

  @Action(
    /^(food|eating out|public transport|taxi|shopping|subscription|chill|travel|gifts|savings|salary|returns|family|other)$/,
  )
  async onCategoryAction(@Ctx() ctx: Context<any>) {
    const category = ctx.callbackQuery.data;
    await ctx.answerCbQuery();
    return this.botService.handleCategorySelection(ctx, category);
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    return this.botService.handleTextMessage(ctx);
  }
}
