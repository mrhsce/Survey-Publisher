const logger = require('./winstonLogger');
const jwtRun = require('./jwtRun');

const config = require('config');
const serverConfig = config.get('mrhsce.serverConfig');

const checkAddress = (address) => {
    if (address === `${serverConfig.SN}/banking/login`) {
        return true
    }
    return false;
};

module.exports = {
    noToken: (req, res, next) => {
        next();
    },
    verifyToken: (req, res, next) => {
        if (checkAddress(req.originalUrl)) {
            next();
        } else {
            jwtRun.tokenValidation(req, 'user', (state, id, role) => {
                if (state) {
                    logger.info('Verify Token API: %s', req.originalUrl);
                    req.userId = id;
                    req.role = role;
                    next();
                } else {
                    logger.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                    return res.status(401).send('Authorization Failed!!!')
                }
            });
        }
    },
}
