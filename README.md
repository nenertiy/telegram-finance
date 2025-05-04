# 💸 Telegram Finance Bot

> **Personal finance tracking made simple — directly in Telegram.**
> Track your expenses and income in multiple currencies, categorize transactions, and get real-time Google Sheets integration.

---

## 📌 Overview

Telegram Finance Bot is a personal finance management tool that helps you track your **expenses** and **income** via Telegram. It integrates with **Google Sheets** to securely store and analyze your financial data, providing an intuitive and automated budgeting experience.

---

## 🚀 Features

* 💱 Multi-currency support: `USD`, `EUR`, `RUB`
* 🗂️ Categorize transactions: food, salary, travel, etc.
* 📊 Google Sheets integration with predefined structure
* 📝 Add transactions with optional descriptions
* 🔄 Auto-calculated balances
* 🔐 Access control for allowed users
* 🌐 Google Sheets auto-tab creation by month (optional)
* 📅 Auto-sorted records and AI-based monthly insights *(planned)*

---

## 🛠️ Tech Stack

* **NestJS** – server-side app framework
* **Telegraf** – Telegram Bot Framework
* **Google Sheets API** – for data persistence
* **TypeScript** – typed development

---

## 📦 Installation

```bash
git clone https://github.com/nenertiy/telegram-finance
cd telegram-finance
npm install
cp .env.example .env
```

### Edit `.env` with your credentials (see below), then:

```bash
npm run build
npm run start:prod
```

---

## ⚙️ Environment Variables

| Variable              | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `PORT`                | Server port (default: `3000`)                                  |
| `TELEGRAM_BOT_TOKEN`  | Telegram bot token (from [@BotFather](https://t.me/BotFather)) |
| `ALLOWED_CHAT_ID`     | Allowed Telegram chat ID                                       |
| `GOOGLE_CLIENT_EMAIL` | Google Service Account email                                   |
| `GOOGLE_PRIVATE_KEY`  | Google Service Account private key                             |
| `GOOGLE_SHEET_ID`     | Target Google Sheet ID                                         |

---

## 📗 Google Sheets Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Sheets API**
4. Create a **Service Account**
5. Download the credentials JSON
6. Share the Google Sheet with your service account email
7. Add the credentials to your `.env`

---

## 🤖 Bot Commands

| Command  | Description                                             |
| -------- | ------------------------------------------------------- |
| `/start` | Welcome message and usage instructions                  |
| `/init`  | Initialize Google Sheet structure with categories       |
| `/add`   | Add new transaction (currency, category, amount, notes) |
| `/clear` | Clear the current input session                         |

---

## 🧑‍💻 Usage

1. Start a chat with your bot in Telegram
2. Use `/init` once to set up the spreadsheet
3. Use `/add` to add transactions:

   * Select currency: `USD`, `EUR`, `RUB`
   * Choose category
   * Enter amount and optional comment

---

## 🌍 Локализация: Telegram Finance Bot на русском

### 📋 Обзор

Telegram Finance Bot — это бот для Telegram, позволяющий легко отслеживать личные финансы: расходы, доходы, категории и балансы. Все данные сохраняются в Google Таблицах для удобной аналитики.

---

### 🔧 Функции

* Поддержка валют: `USD`, `EUR`, `RUB`
* Категории транзакций: еда, транспорт, зарплата и др.
* Интеграция с Google Таблицами
* Добавление описаний к тратам
* Расчет баланса в реальном времени
* Ограничение доступа по Telegram ID

---

### 📦 Установка

```bash
git clone https://github.com/nenertiy/telegram-finance
cd telegram-finance
npm install
cp .env.example .env
```

Отредактируйте `.env` и затем:

```bash
npm run build
npm run start:prod
```

---

### 📄 Переменные окружения

| Переменная            | Описание                                   |
| --------------------- | ------------------------------------------ |
| `PORT`                | Порт сервера (по умолчанию `3000`)         |
| `TELEGRAM_BOT_TOKEN`  | Токен бота Telegram ([@BotFather](https://t.me/BotFather))                        |
| `ALLOWED_CHAT_ID`     | ID Telegram-чата, которому разрешён доступ |
| `GOOGLE_CLIENT_EMAIL` | Email сервисного аккаунта Google           |
| `GOOGLE_PRIVATE_KEY`  | Приватный ключ аккаунта                    |
| `GOOGLE_SHEET_ID`     | ID Google Таблицы                          |

---

### 🧾 Настройка Google Таблицы

1. Создайте проект в Google Cloud Console
2. Включите **Google Sheets API**
3. Создайте сервисный аккаунт
4. Скачайте JSON-файл с ключами
5. Поделитесь доступом к таблице с email сервисного аккаунта
6. Добавьте email и ключ в `.env`

---

### 🤖 Команды бота

| Команда  | Описание                     |
| -------- | ---------------------------- |
| `/start` | Приветствие и инструкции     |
| `/init`  | Инициализация Google Таблицы |
| `/add`   | Добавление новой транзакции  |
| `/clear` | Очистка текущей сессии       |

---

## 🧑‍💻 Использование

1. Начните чат с вашим ботом в Telegram
2. Один раз используйте команду `/init`, чтобы настроить таблицу
3. Используйте команду `/add`, чтобы добавить транзакции:

   * Выберите валюту: `USD`, `EUR`, `RUB`
   * Выберите категорию
   * Введите сумму и при необходимости комментарий
