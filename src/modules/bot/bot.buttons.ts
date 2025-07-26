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
      Markup.button.callback('🛒 Продукты', 'food'),
      Markup.button.callback('🍔 Кафе', 'eating out'),
      Markup.button.callback('🚎 Транспорт', 'public transport'),
      Markup.button.callback('🚕 Такси', 'taxi'),
      Markup.button.callback('🛍️ Покупки', 'shopping'),
      Markup.button.callback('💳 Подписки', 'subscription'),
      Markup.button.callback('😎 Развлечения', 'chill'),
      Markup.button.callback('✈️ Путешествия', 'travel'),
      Markup.button.callback('🎁 Подарки', 'gifts'),
      Markup.button.callback('🏠 Родители', 'family'),
      Markup.button.callback('🏦 Сбережения', 'savings'),
      Markup.button.callback('💵 Зарплата', 'salary'),
      Markup.button.callback('💰 Продажа', 'sell'),
      Markup.button.callback('🪙 Возвраты', 'returns'),
      Markup.button.callback('💿 Другое расходы', 'other expenses'),
      Markup.button.callback('💸 Другое доходы', 'other income'),
    ],
    {
      columns: 2,
    },
  );
};
