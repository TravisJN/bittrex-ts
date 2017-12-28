// node proxy
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const sha512 = require('sha512');
const apiKey = require('../private/Keys.js');
const sqlite = require('sqlite3').verbose();

/**
 * === Getters === 
 */
var getAPISign = function(aUrl) {
    var secret = apiKey.secret;
    var hasher = sha512.hmac(secret);
    //can also call 'update(message)' and then 'finalize()'
    var final = hasher.finalize(aUrl);
    return final.toString('hex');
}

var getAPIKey = function() {
    return apiKey.apiKey;
}

var getNonce = function() {
    return Math.floor(new Date().getTime());
};

/**
 * === Properties ===
 */
var baseUrl = 'https://bittrex.com/api/v1.1',
    queryParams = 'apikey=' + getAPIKey() + '&nonce=' + getNonce(),
    url,
    db;

/**
 * === Methods ===
 */
function initializeDatabase() {
    return new sqlite.Database(__dirname + '/db/orders.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
        if (err) {
            return console.error(err);
        }
        
        console.log('Connected to the orders database.');

        
    })
}

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
var server = app.listen(8080, function () {
   var host = server.address().address;
   var port = server.address().port;
   
   console.log("Bittrex proxy listening at ", host, port);
});

db = initializeDatabase();

// db.serialize(() => {
//     var stmt;
//     console.log('serialized db');

//     db.run("CREATE TABLE if not exists orders (info TEXT)");
//     stmt = db.prepare("INSERT INTO orders VALUES (?)");
//     for (var i = 0; i < 10; i++) {
//         stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();

//     db.each("SELECT rowid AS id, info FROM orders", function(err, row) {
//         console.log(row.id + ": " + row.info);
//     });
// });

db.all('SELECT rowid AS myrowid, info FROM orders', [], (err, rows) => {
    if (err) {
        return err;
    }

    rows.forEach((row) => {
        console.log(row.info);
    })
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Database connection closed.')
})



/**
 * 
 *  //Perform SELECT Operation
    db.all("SELECT * from blah blah blah where this="+that,function(err,rows){
    //rows contain values while errors, well you can figure out.
    });

    //Perform INSERT operation.
    db.run("INSERT into table_name(col1,col2,col3) VALUES (val1,val2,val3)");

    //Perform DELETE operation
    db.run("DELETE * from table_name where condition");

    //Perform UPDATE operation
    db.run("UPDATE table_name where condition");
 */