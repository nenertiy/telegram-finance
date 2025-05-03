import { Markup } from 'telegraf';

export const actionButtons = () => {
  return Markup.keyboard([
    [
      Markup.button.callback('Button 1', 'button1'),
      Markup.button.callback('Button 2', 'button2'),
    ],
  ]);
};
