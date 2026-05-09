#!/usr/bin node

const DatabaseHandler = require('./utils/DatabaseHandler');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const app = express();

const logger = require('./utils/winstonLogger');

const {verifyToken, noToken} = require('./utils/VerifyToken');
const ExceptionHandler = require('./utils/ExceptionHandler');

const swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./openapi.json');

app.use(helmet());

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Sqlite3 connection
db = new DatabaseHandler();


app.set('view engine', 'ejs');

app.post('/', function (req, res) {
    console.log(req.body);
    res.sendFile(__dirname + "/views/dist/index.html/pages/surveys");
});

const config = require('config');
const serverConfig = config.get('mrhsce.serverConfig');

// This handles CORS (F&*K it, this costs me a day)
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,DELETE,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        console.log('OPTIONS');
        res.status(200).send();
    } else {
        next();
    }

});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use('/api/v1', router);


//*********************************** USER ROUTES **********************************************

//user router
app.use(`${serverConfig.SN}/banking`, verifyToken, require('./controllers/banking'),);

//*********************************** GLOBAL ROUTES **********************************************

app.use(`${serverConfig.SN}/upload`, verifyToken, require('./utils/uploadUtils'));

app.use(`${serverConfig.SN}/image`, noToken, require('./utils/imageUtils'));


//*********************************** ADMIN PANEL ROUTES **********************************************

app.use(express.static(__dirname + '/views/dist'));
// Handle root get
app.get('/*', function (req, res) {
    // save html files in the `views` folder...
    res.sendFile(__dirname + "/views/dist/index.html");
});

// start server
const port = process.env.NODE_ENV === 'production' ? serverConfig.productPort : serverConfig.port;
console.log('Montaman Path: ', process.env.PWD);

app.listen(port, function () {
    console.log('Server is running.. on Port ', serverConfig.port);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason)
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});
