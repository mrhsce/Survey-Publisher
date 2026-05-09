const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const logger = require('./winstonLogger');

// Load key paths from environment to avoid keeping private keys in repo.
// Operators should set JWT_PRIVATE_KEY_PATH and JWT_PUBLIC_KEY_PATH.
const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH || path.join(__dirname, 'private.key');
const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || path.join(__dirname, 'public.key');

if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    logger.error('JWT key files not found. Set JWT_PRIVATE_KEY_PATH and JWT_PUBLIC_KEY_PATH environment variables and place keys outside the repository.');
    throw new Error('Missing JWT key files. See README for setup.');
}

// use 'utf8' to get string instead of byte array
const privateKEY = fs.readFileSync(privateKeyPath, 'utf8');
const publicKEY = fs.readFileSync(publicKeyPath, 'utf8');
module.exports = {
    tokenValidation: (req, type, callBack) => {
        let token = req.headers['authorization']; // Express headers are auto converted to lowercase
        logger.info('API: JWT token %j ', token);
        if (token && token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
        if (token) {
            let tokenObj = verify(token, type);
            if (!tokenObj) {
                return callBack(false)
            } else {
                return callBack(true, tokenObj.userId, tokenObj.role)
            }

        } else {
            return callBack(false)
        }
    },
    sign: (payload) => {
        logger.info('API: JWT sign payload %j ', payload);
        let Options = {
            issuer: "MrHsCE server",
            subject: "mrhsce@gmail.com",
            // audience: "Client_Identity" // this should be provided by client
        };

        // Token signing options
        const signOptions = {
            issuer: Options.issuer,
            subject: Options.subject,
            // audience:  Options.audience,
            // expiresIn: "90d",
            algorithm: "RS256"
        };

        return jwt.sign(payload, privateKEY, signOptions);
    },
    decode: (token) => {
        return jwt.decode(token, {complete: true});
        //returns null if token is invalid
    }
};

function verify(token, type) {
    // logger.info('TokenValidation verify token is: %s ',token);
    vOption = {
        issuer: "MrHsCE server",
        subject: "mrhsce@gmail.com",
        // audience: "Client_Identity" // this should be provided by client
    };

    let verifyOptions = {
        issuer: vOption.issuer,
        subject: vOption.subject,
        // audience:  vOption.audience,
        // expiresIn: "90d",
        algorithm: ["RS256"]
    };

    try {
        return jwt.verify(token, publicKEY, verifyOptions);
    } catch (err) {
        return false;
    }
}
