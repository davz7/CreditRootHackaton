# Manana Seguro Bot

## Overview
`manana-seguro-bot` is a Telegram bot for Mañana Seguro, a retirement savings experience built around USDC, Stellar testnet wallet checks, and guided user conversations.

The bot provides:
- AI retirement guidance using Anthropic Claude.
- An interactive retirement projection simulator.
- Wallet capture and balance lookup flow.
- Deposit confirmation flow and local conversation persistence.
- Utility commands such as help, QR sharing, demo tour, and CETES rate alerts.

## Setup
1. Install Python 3.10+.
2. From `manana-seguro-bot/`, install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create your env file from the example (the repo already includes `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Set credentials:
   - Telegram token (BotFather):
     1. Open Telegram and talk to [@BotFather](https://t.me/BotFather).
     2. Run `/newbot` and complete the bot name + username prompts.
     3. Copy the bot token and set it as `TELEGRAM_TOKEN` in `.env`.
   - Anthropic API key:
     1. Open the Anthropic Console at `https://console.anthropic.com/`.
     2. Create or copy an API key.
     3. Set it as `ANTHROPIC_API_KEY` in `.env`.
5. Run the bot:
   ```bash
   python bot.py
   ```

For Procfile-based worker platforms, the process command is:
```bash
worker: python bot.py
```

## Environment variables
Environment variables are loaded from `.env` via `python-dotenv`.

Use `.env.example` as the template:

- `TELEGRAM_TOKEN`: Telegram bot token from BotFather.
- `ANTHROPIC_API_KEY`: Anthropic API key used for the `/asesoria` chat flow.

## Bot commands
Main command handlers currently wired in `bot.py`:

- `/start`: Welcome message and main keyboard.
- `/asesoria`: Starts AI advisory mode (free-text chat with Claude).
- `/simular`: Starts the retirement simulator flow.
- `/saldo`: Shows wallet/contract-style balance view (asks for wallet if missing).
- `/depositar`: Starts deposit flow (wallet capture, amount, confirmation).
- `/menu`: Returns the user to the main menu.
- `/ayuda`: Shows command list.
- `/qr`: Sends a QR image if available, otherwise shares the bot link.
- `/demo`: Runs the guided product demo sequence.
- `/alertas`: Toggles CETES rate-change notifications.

Conversation flow summary:

- Advisory flow: `/asesoria` -> user asks questions -> bot answers with Claude until `/menu`.
- Simulator flow: `/simular` -> monthly amount -> years -> incentive choice -> projection result.
- Deposit flow: `/depositar` -> wallet (if needed) -> amount -> confirm/cancel callback.
- Balance flow: `/saldo` -> wallet (if needed) -> Stellar testnet + local blocked balance view.

## Architecture notes
Key files:

- `bot.py`: Main Telegram application, conversation state machine, command handlers, and scheduled CETES alert checks.
- `core/proyecciones.py`: Savings projection logic, APY/incentive constants, and currency formatting helpers.
- `stellar_connection.py`: Stellar/Soroban testnet helpers and contract metadata (`CONTRACT_ID`).
- `genera_qr.py`: Generates a shareable QR asset for the bot.

Runtime architecture:

- Built with `python-telegram-bot` async handlers and a `ConversationHandler`.
- Persists conversation/user data in `bot_data.pkl` using `PicklePersistence`.
- Uses Anthropic messages API for AI advisory replies.
- Uses Stellar testnet endpoints for wallet and contract-related reads.
