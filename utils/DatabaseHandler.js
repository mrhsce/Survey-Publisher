const betterSqlite3 = require('better-sqlite3');
const fs = require('fs');
const logger = require('./winstonLogger');


class DatabaseHandler{
    constructor(){
        // Load DB path from environment to avoid shipping production DB in the repository
        const dbPath = process.env.SQLITE_DB_PATH || './main.db';
        if (!fs.existsSync(dbPath)) {
            logger.warn(`SQLite DB not found at ${dbPath}. Create the DB and set SQLITE_DB_PATH or place a main.db in the project root.`);
        }
        this.dbSync = new betterSqlite3(dbPath, null);
    }

    addSMS(message){
        let sql = `INSERT INTO SMS(date, type, text, account) VALUES(?, ?, ?, ?)`;

        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python3',["./publisher.py", message.text]);
        let result = this.dbSync.prepare(sql).run(message.date ,message.type ,message.text ,message.account);

        pythonProcess.stdout.on('data', (data) => {
            if (data.toString().includes("success")){
                this.setSmsPublished(result.lastInsertRowid);
                logger.info("!!! TELEGRAM Publish Success !!! %j", result.lastInsertRowid);
            }
        });

        return result;
    }

    setSmsPublished(id){
        let sqlUpdate = `UPDATE SMS SET published=1 WHERE id = ?`;
        return this.dbSync.prepare(sqlUpdate).run(id);
    }


//**********************************************************************************************

    authenticateUser(username, passwordHash, successCallback, failureCallback){
        let sql = `SELECT *  FROM User WHERE username  = ? and password = ?`;

        // first row only
        let user = this.dbSync.prepare(sql).get([username, passwordHash]);
        if(user){
            successCallback(user)
        }
        else{
            logger.error("!!! sqlite authenticateUser error !!! %j", err);
            failureCallback()
        }
    }

}

module.exports = DatabaseHandler;
