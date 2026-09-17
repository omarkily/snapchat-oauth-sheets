# Snapchat OAuth → Google Sheets

Node.js + Express service that connects **Snap Kit Login** to **Google Sheets** for auth + event logging.

Portfolio showcase of OAuth integrations, webhooks, and third-party API wiring.

## What it does

1. Starts a Snapchat OAuth login (`/snapchat/login`)
2. Handles the callback and exchanges the code for tokens
3. Accepts Snap Lens / interaction webhooks
4. Appends structured events to a Google Sheet (ID, display name, event type, metadata, timestamp)

## Stack

- Node.js 18+ · Express
- Snap Kit OAuth
- Google Sheets API (service account)
- Helmet · CORS · dotenv

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Server default: [http://localhost:3000](http://localhost:3000)

## Environment

All values in `.env.example` are placeholders — never commit real secrets.

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `3000`) |
| `SNAPCHAT_CLIENT_ID` | Snap Kit client ID |
| `SNAPCHAT_CLIENT_SECRET` | Snap Kit client secret |
| `SNAPCHAT_REDIRECT_URI` | OAuth redirect URI |
| `GOOGLE_SHEETS_ID` | Target spreadsheet ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | Service account private key (`\n` escaped) |
| `GOOGLE_SHEET_NAME` | Optional sheet tab name (default `Sheet1`) |

### Snap Kit setup

1. Create an app at [kit.snapchat.com](https://kit.snapchat.com/)
2. Enable Login Kit
3. Add your redirect URI
4. Copy Client ID / Secret into `.env`

### Google Sheets setup

1. Enable Sheets API in Google Cloud
2. Create a service account + JSON key
3. Share the sheet with the service account (Editor)
4. Put email + private key in `.env`

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/snapchat/login` | GET | Start OAuth |
| `/snapchat/callback` | GET | OAuth callback |
| `/webhook/lens` | POST | Lens / event webhook |

### Sheet columns

| Column | Field |
|--------|--------|
| A | Snapchat ID |
| B | Display name |
| C | Event type |
| D | Metadata (JSON) |
| E | Timestamp |

## Test

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/webhook/lens \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test123","action":"button_click","lens_id":"lens456"}'
```

## Project layout

```
src/
  config/       # Env-driven config
  routes/       # Health, Snapchat OAuth, webhooks
  services/     # Snapchat + Sheets clients
  middleware/   # Errors
  utils/        # Logger
```

## License

ISC
