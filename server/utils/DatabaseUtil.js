const sqlite = require('sqlite3').verbose();
const _ = require('underscore');

class DatabaseUtil {
    
    constructor() {
        this.sqlQuery = {
            createOrdersTable: 'CREATE TABLE Orders (id integer, date text, currency text, current_price text, highest_price text, percent_from_high text, percent_change text, sell_placed boolean);',
            insertIntoOrders: 'INSERT INTO Orders(id, date, currency, current_price, highest_price, percent_from_high, percent_change, sell_placed) VALUES (?, ?, ?, ?, ?, ?, ?, ?);'
        }
    }

    initializeDatabase() {
        this.db = new sqlite.Database('./server/db/orders.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
            if (err) {
                return console.error(err);
            }
            
            console.log('Connected to the orders database.');  
        });

        return this.db;
    }

    buildTable() {
        this.db.run(this.sqlQuery.createOrdersTable, [], (err) => {
            if (err) {
                return console.error(err);
            }
        });
    }

    // will more specifically name this method later
    insertRow(aRowInfo) {
        let rowOptions = _.values(aRowInfo);

        this.db.serialize(() => {
            this.db.run(this.sqlQuery.insertIntoOrders, 
            rowOptions,
            (err) => {
                if (err) {
                    return console.log(err);
                }
                console.log('new row inserted woop woop!');
            });
            
            this.db.each("SELECT * FROM Orders", function(err, row) {
                let logString = '';
                for (var key in row) {
                    logString += key + ': ' + row[key] + ' | ';
                }          
                console.log(logString);
            });
        });
    }
}

module.exports = DatabaseUtil;

/**
 * db.all('SELECT rowid AS myrowid, info FROM orders', [], (err, rows) => {
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
 