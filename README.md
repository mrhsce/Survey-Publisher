# SurveyPublisher

SurveyPublisher is a small, self-contained Node.js backend for collecting short messages (SMS/survey items), storing them in a local SQLite database, serving a simple single-page frontend, and publishing messages to a Telegram channel via an auxiliary Python publisher.

This repository contains the server code and utilities used in a lightweight survey / message publishing system. It is designed to be easy to run on a single VM or development machine.

This README has been cleaned to remove confidential artifacts. Sensitive items that were present in the original developer copy (database files, private keys and Telegram session files) must be created by each operator and must never be published in a public repository. See the "Security & secrets" section below for details and placeholders.

Table of contents
- Project overview
- Main features
- Architecture
- Quick setup
- Configuration & secrets (placeholders)
- Running
- Production notes & recommended fixes
- Security & publishing checklist

Project overview
----------------
- Purpose: accept user login, store short messages in SQLite, optionally attach/upload images for surveys, and publish message text to a configured Telegram channel.
- Intended audience: developers or teams who want a minimal backend prototype (or internal tool) that demonstrates JWT auth, file uploads, SQLite usage, and an external publisher integration.

Main features
-------------
- Local SQLite datastore (file-based) for users and messages
- JWT-based authentication using RS256
- API endpoints for login, posting messages, and image upload/download
- Simple integration with a Python-based Telegram publisher (separate process)
- Swagger/OpenAPI UI available at /api-docs

Architecture (high level)
-------------------------
- Node.js + Express application (server.js)
  - `controllers/` contains route handlers (e.g. `banking.js`)
  - `utils/` contains database wrapper, JWT helpers, upload/image utilities, and a logger
- SQLite database: `main.db` (NOT included in public releases)
- Python publisher script (`publisher.py`) that uses Telethon to send messages to Telegram. The script uses a Telethon session file (NOT included in public releases).

Quick setup (development)
-------------------------
1. Install Node.js (14+ recommended) and Python 3.8+.
2. Install Node dependencies:

```bash
npm install
```

3. Create RSA keys for JWT signing (private key kept secret). Example (run locally, do not commit keys):

```bash
openssl genpkey -algorithm RSA -out jwt_private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem
```

Place `jwt_private.pem` and `jwt_public.pem` in a secure folder outside of the repository and configure the server to load them (see Configuration section).

4. Install Python dependencies for the publisher (in a virtualenv):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install telethon
```

5. Create a Telethon session for the publisher (local, do not commit the session file). You need a `api_id` and `api_hash` from https://my.telegram.org. Example interactive script to create `publisher.session`:

```python
# run a short Python script using Telethon to create the session and then exit.
from telethon.sync import TelegramClient
api_id = <YOUR_API_ID>
api_hash = '<YOUR_API_HASH>'
with TelegramClient('publisher', api_id, api_hash) as client:
    print('session created')

```

6. Create a configuration file or set environment variables (see next section).

Configuration & secrets (placeholders)
------------------------------------
This project must not include private keys, database files, or publisher sessions in version control. Replace these with placeholders and configure the runtime to load them from a secure location or environment variables.

Essential items (examples of placeholders):

- JWT private key file: path set by env JWT_PRIVATE_KEY_PATH or CONFIG
- JWT public key file: path set by env JWT_PUBLIC_KEY_PATH or CONFIG
- Telegram API credentials: TELEGRAM_API_ID, TELEGRAM_API_HASH (fill your own values)
- Publisher session file: create locally (e.g. `publisher.session`), do not commit
- SQLite database file: path to `main.db` (create/initialize locally)

Create a `.env` or use your system environment variables. Example `.env.example` (DO NOT commit actual `.env` with secrets):

```
PORT=3000
JWT_PRIVATE_KEY_PATH=/path/to/jwt_private.pem
JWT_PUBLIC_KEY_PATH=/path/to/jwt_public.pem
TELEGRAM_API_ID=123456
TELEGRAM_API_HASH=yourhash
SQLITE_DB_PATH=/path/to/main.db
UPLOAD_DIR=/path/to/views/images
```

Running the server (development)
-------------------------------
Start the server locally:

```bash
# ensure env variables are set (example)
export JWT_PRIVATE_KEY_PATH=/home/you/keys/jwt_private.pem
export JWT_PUBLIC_KEY_PATH=/home/you/keys/jwt_public.pem
export TELEGRAM_API_ID=123456
export TELEGRAM_API_HASH=yourhash
export SQLITE_DB_PATH=/home/you/data/main.db

npm start
```

Or run with pm2 for background operation:

```bash
npm install -g pm2
pm2 start server.js --name SurveyPublisher
pm2 save
```

API / useful endpoints
----------------------
- POST /api-v1/banking/login — authenticate with username/password; returns JWT
- POST /api-v1/banking/sms — post one or more messages (requires JWT)
- Image upload & download endpoints under /api-v1/upload (protected) and /api-v1/image (public reads)
- Swagger UI: /api-docs