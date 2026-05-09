import sqlite3

from telethon.sync import TelegramClient
from telethon.tl import types
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
    except Error as e:
        print(e)
    return None


api_id = 1
api_hash = "0"
channel_name = 'مخارج'

try:
    # The first parameter is the .session file name (absolute paths allowed)
    with TelegramClient('publisher', api_id, api_hash) as client:
        if sys.argv[1]:
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
except:
  print("error")
  sys.stdout.flush()
