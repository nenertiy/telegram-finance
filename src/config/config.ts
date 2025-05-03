export default () => ({
  PORT: parseInt(process.env.PORT) || 3000,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  ALLOWED_CHAT_ID: parseInt(process.env.ALLOWED_CHAT_ID),
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
});
