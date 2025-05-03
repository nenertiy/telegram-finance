import { Markup } from 'telegraf';

export const moneyButtons = () => {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('RUB', 'rub'),
      Markup.button.callback('USD', 'usd'),
      Markup.button.callback('EUR', 'eur'),
    ],
    {
      columns: 3,
    },
  );
};

export const categoryButtons = () => {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('🛒 Food', 'food'),
      Markup.button.callback('🍔 Eating out', 'eating out'),
      Markup.button.callback('🚎 Public transport', 'public transport'),
      Markup.button.callback('🚕 Taxi', 'taxi'),
      Markup.button.callback('🛍️ Shopping', 'shopping'),
      Markup.button.callback('💳 Subscription', 'subscription'),
      Markup.button.callback('😎 Chill', 'chill'),
      Markup.button.callback('✈️ Travel', 'travel'),
      Markup.button.callback('🎁 Gifts', 'gifts'),
      Markup.button.callback('🏦 Savings', 'savings'),
      Markup.button.callback('💵 Salary', 'salary'),
      Markup.button.callback('🪙 Returns', 'returns'),
      Markup.button.callback('💿 Other', 'other'),
    ],
    {
      columns: 2,
    },
  );
};
