import sqlite3
import os
from telethon.sync import TelegramClient
import sys


def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Exception as e:
        print(e)
    return None


# Read Telegram credentials from environment. Do NOT hard-code API credentials in repo.
try:
    api_id = int(os.environ.get('TELEGRAM_API_ID', '0'))
    api_hash = os.environ.get('TELEGRAM_API_HASH', '0')
except Exception:
    api_id = 0
    api_hash = '0'

session_name = os.environ.get('TELETHON_SESSION_NAME', 'publisher')
channel_name = os.environ.get('TELEGRAM_CHANNEL_NAME', 'مخارج')

if api_id == 0 or api_hash == '0':
    print('error: TELEGRAM_API_ID and TELEGRAM_API_HASH environment variables must be set')
    sys.stdout.flush()
    sys.exit(1)

try:
    # The first parameter is the .session file name (absolute paths allowed)
    with TelegramClient(session_name, api_id, api_hash) as client:
        if len(sys.argv) > 1 and sys.argv[1]:
            message = sys.argv[1]
            entity = client.get_entity(channel_name)
            result = client.send_message(entity=entity, message=message)
            if result:
                print('success')
                sys.stdout.flush()
            else:
                raise Exception("Publish message failed")
        else:
            raise Exception("No message")
except Exception:
    print("error")
    sys.stdout.flush()
