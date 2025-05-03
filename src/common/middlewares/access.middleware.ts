import { Context } from 'telegraf';
import { ConfigService } from '@nestjs/config';

export function AccessMiddleware(configService: ConfigService) {
  const allowedChatId = configService.get<number>('ALLOWED_CHAT_ID');

  return async function accessGuard(ctx: Context, next: () => Promise<void>) {
    if (ctx.chat?.id !== allowedChatId) {
      await ctx.reply('У вас нет доступа');
      return;
    }
    await next();
  };
}
