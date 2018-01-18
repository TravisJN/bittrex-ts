// node proxy
const express       = require('express');
const fetch         = require('node-fetch');
const sha512        = require('sha512');
const apiKey        = require('../private/Keys.js');
const DatabaseUtil  = require('./utils/DatabaseUtil.js');
const BaseController = require('./controller/BaseController');
const PingPongController = require('./controller/PingPongController');
const MovingAverageController = require('./controller/MovingAverageController');
const app           = express();
//const dbUtil        = new DatabaseUtil();

/**
 * === Properties ===
 */
const baseUrl = 'https://bittrex.com/api/v1.1';
const queryParams = 'apikey=' + getAPIKey() + '&nonce=' + getNonce();
var server;
var url;
var db;

/**
 * === Getters === 
 */
function getAPISign(aUrl) {
    var secret = apiKey.secret;
    var hasher = sha512.hmac(secret);
    //can also call 'update(message)' and then 'finalize()'
    var final = hasher.finalize(aUrl);
    return final.toString('hex');
}

function getAPIKey() {
    return apiKey.apiKey;
}

function getNonce() {
    return Math.floor(new Date().getTime());
};


/**
 * === Methods ===
 */

/**
 * === Server routing ===
 */
app.use(function(req, res, next) {
    console.log(req.path);
    url = baseUrl + req.originalUrl + queryParams;

    console.log(url);

    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', function (req, res) {
    fetch(url, {
        headers: {
            'apisign': getAPISign(url)
        }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(body) {
        res.send(body);
    });
});

/**
 * === Initialize ===
 */
function init() {
    //var pingPongController = new PingPongController();
    var movingAverageController = new MovingAverageController();

    // Start node server
    server = app.listen(8080, function () {
        var host = server.address().address;
        var port = server.address().port;
        
        console.log("Bittrex proxy listening at ", host, port);
    });

    //this.initDB();
}

function initDB() {
    // Start database
    db = dbUtil.initializeDatabase();
    dbUtil.buildTable();
    dbUtil.insertRow(rowObject);
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Database connection closed.');
    });

}

init();
