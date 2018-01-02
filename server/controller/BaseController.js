/**
 *  This controller will be responsible for making the actual requests to the Bittrex API
 *  It will simply be responsible for executing Buys, Sells, and fetching market data for a given currency
 */
const fetch     = require('node-fetch');
const sha512    = require('sha512');
const apiKey    = require('../../private/Keys.js');

const DatabaseUtil  = require('../utils/DatabaseUtil.js');
const dbUtil        = new DatabaseUtil();

class BaseController {
    constructor() {
        this.baseUrl = 'https://bittrex.com/api/v1.1';
        this.queryParams = 'apikey=' + this.getAPIKey() + '&nonce=' + this.getNonce();

        this.initDatabase();
    }
    
    initDatabase() {
        this.db = dbUtil.initializeDatabase();
        
        dbUtil.buildTable();
        
        // db.close((err) => {
        //     if (err) {
        //         return console.error(err.message);
        //     }
        //     console.log('Database connection closed.');
        // });
    }

    getAPISign(aUrl) {
        var secret = apiKey.secret;
        var hasher = sha512.hmac(secret);
        //can also call 'update(message)' and then 'finalize()'
        var final = hasher.finalize(aUrl);
        return final.toString('hex');
    }

    getAPIKey() {
        return apiKey.apiKey;
    }
    
    getNonce() {
        return Math.floor(new Date().getTime());
    };

    executeBuy(aMarket, aQuantity, aRate) {
        let requestUrl = this.baseUrl + '/market/buylimit?' + this.queryParams + '&market=' + aMarket + '&quantity=' + aQuantity + '&rate=' + aRate;

        return this.makeRequest(requestUrl);        
    }

    executeSell(aMarket, aQuantity, aRate) {
        let requestUrl = this.baseUrl + '/market/selllimit?' + this.queryParams + '&market=' + aMarket + '&quantity=' + aQuantity + '&rate=' + aRate;
        
        return this.makeRequest(requestUrl);
    }

    fetchCurrencyData(aMarket) {
        let requestUrl = this.baseUrl + '/public/getticker?market=' + aMarket;

        return this.makeRequest(requestUrl)
    }

    fetchOpenOrders(aMarket) {
        let requestUrl = this.baseUrl + '/market/getopenorders?' + this.queryParams + '&market=' + aMarket;
        
        return this.makeRequest(requestUrl);
    }
    
    makeRequest(aUrl) {
        return fetch(aUrl, {
                headers: {
                    'apisign': this.getAPISign(aUrl)
                }
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(body) {
                return body;
            });
    }
}

module.exports = BaseController;