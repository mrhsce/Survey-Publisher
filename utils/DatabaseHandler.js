const betterSqlite3 = require('better-sqlite3');
const logger = require('./winstonLogger');


class DatabaseHandler{
    constructor(){

        this.dbSync = new betterSqlite3('./main.db', null);
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
