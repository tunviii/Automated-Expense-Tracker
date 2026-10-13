# Automated Expense Tracker

A small Expo + React Native portfolio MVP for turning transaction messages into a reviewable personal-finance ledger.

## Current capabilities

- Home dashboard with computed monthly spending, incoming credits, category bars, and recent transactions.
- Transactions view with All, Debits, and Credits filters.
- Honest local demo data with fixed fictional Indian-rupee transactions.
- Pure rule-based SMS parser for text supplied manually by the user.
- Built-in parser demo with sample text and visible missing-field handling.
- Settings view that distinguishes demo data from unimplemented automation.

## Technology

- Expo SDK 57 and Expo Router
- React Native 0.86 with TypeScript
- React Native Safe Area Context
- No chart, SMS, backend, or ML dependencies are bundled in this first commit.

## Run locally

```bash
npm install
npm run typecheck
npm run start
```

Then open the project with Expo Go, an Android emulator, an iOS simulator, or press `w` for the web build. `npm run lint` is available after the Expo ESLint configuration is installed.

## Project structure

```text
src/
  app/                 Expo Router entry routes
  components/          reusable dashboard, common, and transaction UI
  constants/           theme and category metadata
  data/                fixed fictional demo transactions
  hooks/               derived expense totals and filters
  navigation/          in-app MVP tab shell
  screens/             Home, Transactions, and Settings views
  services/sms/        pure parser and smoke assertions
  types/               transaction contracts
  utils/                currency and date formatting
```

## Intentional limitations

The dashboard is powered by local mock data only. The parser reads only text manually provided to it and does not request SMS permissions, read notifications, or sync transactions. Automatic SMS/notification capture, persistence, account connections, backend APIs, and ML classification are planned work and are not connected to the mobile app.

## Roadmap

1. Add a reviewed Android SMS or notification intake layer with explicit consent.
2. Persist imported transactions and add an edit/review queue.
3. Expose future ML classification through a separate service rather than bundling model artifacts in the React Native app.
4. Add privacy-focused export and deletion controls.

## Privacy

Never commit real SMS messages, account identifiers, API keys, credentials, or personal financial data. The included transaction examples are fictional demo records.

Suggested first commit:

```text
feat: add expense tracker mobile MVP and SMS parser demo
```
