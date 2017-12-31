/**
 * This will contain the logic to perform a simple ping-pong buy-sell
 *   Ping-Pong: 1) Buy a currency at some price
 *              2) Sell that currency at a set price 
 *              3) If currency is no longer owned and price hits original buy price, buy again
 *              4) Sell that currency at a set price
 *              5) Repeat
 *  Example:
 *              1) Buy LTC at 100
 *          Price drops to 90 then goes up to 110
 *              2) Sell LTC at 110
 *          Price continues up to 120 then drops back down to 100
 *              3) Buy LTC at 100
 *          Price fluctuates until again hitting 110
 *              4) Sell LTC at 110
 */

const BaseController = require('./BaseController');

class PingPongController extends BaseController {

    constructor() {
        super();

        this.buyPrice = 0;
        this.sellPrice = 0;
        this.currentPrice = 0;
        this.quantity = 0;
        this.isOwned = false;
        this.interval = 5000;
        this.market = '';

        this.timer = setInterval(this.checkPrice, this.interval);
    }

    // Hard coding a ping pong here for the first one
    initPingPong(aMarket = 'BTC-XLM') {
        this.market = aMarket;
        this.fetchCurrencyData(this.market).then((result) => {
            this.currentPrice = result.Last;

            this.executeBuy(this.market, 0.005, this.currentPrice).then((result) => {
                // New entry in database
                console.log('Buy order placed');
                console.log(result);
            });
        });
    }

    checkPrice() {
        // get current price
        this.fetchCurrencyData(this.market).then((result) => {
            this.currentPrice = result.Last;

            if (this.isOwned) {
                if (this.currentPrice >= this.sellPrice) {
                    this.executeSell(this.market, this.quantity, this.currentPrice).then((result) => {
                        // New entry in database
                        console.log('Sell order placed');
                        console.log(result);
                    })
                }
            } else {
                if (this.currentPrice <= this.buyPrice) {
                    this.executeBuy(this.market, this.quantity, this.currentPrice).then((result) => {
                        // New entry in database
                        console.log('Buy order placed');
                        console.log(result);
                    });
                }
            }
        });
        // if isOwned
            // if current price > sellPrice
                // sell at current price
            // else 
                // do nothing
        // else 
            // if current price <= buyPrice
                //buy at current price
            // else
                // do nothing
    }
}

module.exports = PingPongController;