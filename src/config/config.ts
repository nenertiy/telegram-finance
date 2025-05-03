export default () => ({
  PORT: parseInt(process.env.PORT) || 3000,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  ALLOWED_CHAT_ID: parseInt(process.env.ALLOWED_CHAT_ID),
});
