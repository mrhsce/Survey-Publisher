const express = require('express')
    , router = express.Router();

const logger = require('../utils/winstonLogger');

const crypto = require('crypto');
const jwtRun = require('../utils/jwtRun');

const ExceptionHandler = require('../utils/ExceptionHandler');


//______________________USER_LOGIN_____________________
router.post('/login', function (req, res) {

    let password = '';
    if (req.body.password) {
        password = crypto.createHash('sha256').update(req.body.password).digest('hex');
    }


    logger.info('API: user/login %j', {body: req.body, password: password});

    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        logger.error('API: user/login %j', {message: 'bad data', response: 400});
        return res.status(400).send('bad data');
    }

    // query to the database and get the data
    db.authenticateUser(req.body.username, password, (user) => {
            const token = jwtRun.sign({userId: user.id, role: 'user'});
            const responseObject = {token: token, name: user.name, family: user.family, role: user.role};
        res.set({
                errCode: 0,
                errMessage: 'Success',
            }).type('application/json').status(200).send(responseObject);
    },
        () => {
            res.set({
                errCode: -1,
                errMessage: 'Authorization Failed',
            }).status(401).send("نام کاربری یا رمز عبور نادرست است");
        });
});

//______________________Add new sms(es)_____________________//
router.post('/sms', function (req, res) {

    let isMultiple = Array.isArray(req.body);
    if(isMultiple){
        let addedCount = 0;
        req.body.map(message => {
            let result = db.addSMS(message);
            addedCount += result.changes;
        });
        res.set({
            errCode: 0,
            errMessage: 'Success',
        }).type('application/json').status(200).send(
            {message: 'success multiple', count: addedCount}
        );
    }
    else{
        let result = db.addSMS(req.body);
            res.set({
                errCode: 0,
                errMessage: 'Success',
            }).type('application/json').status(200).send(
                {message: 'success single', smsId: result.lastInsertRowid}
            );
    }

});

module.exports = router;
