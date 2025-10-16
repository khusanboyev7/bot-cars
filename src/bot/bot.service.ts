import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';

@Injectable()
export class BotService {
  async start(ctx: Context) {
    await ctx.replyWithHTML(
      '👋 Salom! Bot-cars botga xush kelibsiz.',
      Markup.keyboard([['Moshinalar'], ['Asosiy menyu qaytish']]).resize(),
    );
  }
}
