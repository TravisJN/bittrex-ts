// node proxy
const express       = require('express');
const fetch         = require('node-fetch');
const sha512        = require('sha512');
const apiKey        = require('../private/Keys.js');
const DatabaseUtil  = require('./utils/DatabaseUtil.js');
const app           = express();
const dbUtil        = new DatabaseUtil();

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
// function initializeDatabase() {
//     return new sqlite.Database(__dirname + '/db/orders.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
//         if (err) {
//             return console.error(err);
//         }
        
//         console.log('Connected to the orders database.');  
//     });
// }

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
    }).then(function(body) {
        res.send(body);
    });
});

/**
 * === Initialize ===
 */
function init() {

    // mock data for dev-ing
    var rowObject = {
        id: 27,
        date: 'december 28 7pm',
        currency: 'BTC-XMR',
        current_price: '0.13',
        highest_price: '0.13',
        percent_from_high: '0',
        percent_change: '5',
        sell_placed: false
    }


    // Start node server
    server = app.listen(8080, function () {
        var host = server.address().address;
        var port = server.address().port;
        
        console.log("Bittrex proxy listening at ", host, port);
    });
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
// db.all('SELECT rowid AS myrowid, info FROM orders', [], (err, rows) => {
//     if (err) {
//         return err;
//     }

//     rows.forEach((row) => {
//         console.log(row.info);
//     })
// });

// db.close((err) => {
//     if (err) {
//         return console.error(err.message);
//     }
//     console.log('Database connection closed.')
// });
