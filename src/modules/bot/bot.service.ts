import { SheetsService } from './../sheets/sheets.service';
import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { categoryButtons, moneyButtons } from './bot.buttons';

@Injectable()
export class BotService {
  private userSessions: Map<
    number,
    {
      currency?: string;
      category?: string;
      step: 'currency' | 'category' | 'amount';
    }
  > = new Map();

  constructor(private readonly sheetsService: SheetsService) {}

  async onStart(ctx: Context) {
    await ctx.reply(
      `<b>👋 Добро пожаловать в Финансового Бота!</b>

<i>💡 Этот бот поможет вам вести учёт расходов и доходов прямо в Google Таблице.</i>
  
<b>📌 Основные команды:</b>
<b>/init</b> — создать таблицу и ввести начальный баланс  
<b>/add</b> — добавить новую транзакцию  
<b>/clear</b> — сбросить текущую сессию
  
<i>🧾 Просто введите сумму и категорию, а остальное бот сделает сам!</i>`,
      { parse_mode: 'HTML' },
    );
  }

  async onInit(ctx: Context) {
    try {
      const userId = ctx.from.id;
      this.userSessions.set(userId, { step: 'currency', category: 'init' });
      await ctx.reply(
        'Введите начальные суммы для каждой валюты в формате: USD EUR RUB (например: 100 200 300)',
      );
    } catch (error) {
      console.error('Ошибка при инициализации таблицы:', error);
      await ctx.reply(
        'Произошла ошибка при инициализации таблицы. Пожалуйста, проверьте настройки доступа к Google Sheets.',
      );
    }
  }

  async onAdd(ctx: Context) {
    const userId = ctx.from.id;

    this.userSessions.set(userId, { step: 'currency' });

    await ctx.reply('Выберите валюту:', moneyButtons());
  }

  async onClear(ctx: Context) {
    const userId = ctx.from.id;
    this.userSessions.delete(userId);
    await ctx.reply('Данные сессии очищены.');
  }

  async handleCurrencySelection(ctx: Context, currency: string) {
    const { userId, session } = await this.checkSession(ctx);

    session.currency = currency;
    session.step = 'category';
    this.userSessions.set(userId, session);

    await ctx.reply(
      `Вы выбрали ${currency.toUpperCase()}. Теперь выберите категорию:`,
      categoryButtons(),
    );
  }

  async handleCategorySelection(ctx: Context, category: string) {
    const { userId, session } = await this.checkSession(ctx);

    session.category = category;
    session.step = 'amount';
    this.userSessions.set(userId, session);

    await ctx.reply(
      `Вы выбрали категорию "${category}". Введите сумму и описание (опционально)"`,
    );
  }

  async handleTextMessage(ctx: Context<any>) {
    const { userId, session } = await this.checkSession(ctx);

    const text = ctx.message.text;

    if (session.category === 'init') {
      try {
        const parts = text.split(' ');
        const usdAmount = Number(parts[0]?.replace(',', '.') || 0);
        const eurAmount = Number(parts[1]?.replace(',', '.') || 0);
        const rubAmount = Number(parts[2]?.replace(',', '.') || 0);

        if (isNaN(usdAmount) || isNaN(eurAmount) || isNaN(rubAmount)) {
          await ctx.reply(
            'Неверный формат сумм. Используйте числа, например: "100 200 300"',
          );
          return;
        }

        await this.sheetsService.initFinance(usdAmount, eurAmount, rubAmount);
        this.userSessions.delete(userId);
        await ctx.reply(
          'Инициализация таблицы успешно завершена. Создана структура с категориями расходов и доходов и начальными суммами. Теперь вы можете добавлять новые транзакции /add.',
        );
      } catch (error) {
        console.error('Ошибка при инициализации таблицы:', error);
        await ctx.reply(
          'Произошла ошибка при инициализации таблицы. Пожалуйста, проверьте настройки доступа к Google Sheets.',
        );
      }
      return;
    }

    if (!session.currency || !session.category) {
      await ctx.reply('Сессия неполная. Используйте /add для начала.');
      return;
    }

    const parts = text.split(' ');

    try {
      const amount = Number(parts[0].replace(',', '.'));
      const description = parts.slice(1).join(' ');

      if (isNaN(amount)) {
        await ctx.reply(
          'Неверный формат суммы. Используйте число, например: "100"',
        );
        return;
      }

      await this.sheetsService.addTransaction({
        currency: session.currency,
        category: session.category,
        amount: amount,
        description: description,
      });

      this.userSessions.delete(userId);
      await ctx.reply(
        'Транзакция успешно сохранена! Используйте /add для добавления новой транзакции.',
      );
    } catch (error) {
      console.error('Ошибка при сохранении транзакции:', error);
      await ctx.reply(
        'Произошла ошибка при сохранении транзакции. Попробуйте еще раз или используйте /clear для сброса.',
      );
    }
  }

  private async checkSession(
    ctx: Context,
  ): Promise<{ userId: number; session: any } | null> {
    const userId = ctx.from.id;
    const session = this.userSessions.get(userId);

    if (!session) {
      await ctx.reply('Сессия не найдена. Используйте /add для начала.');
      return;
    }

    return { userId, session };
  }
}
