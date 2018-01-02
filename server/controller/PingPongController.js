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

        this.percentGain = 0.015;  // Used to calculate sell price
        this.buyPrice = 0.000051;
        this.sellPrice = Number.MAX_SAFE_INTEGER;
        this.currentPrice = 0;
        this.quantity = 250;
        this.isOwned = false;
        this.orderPlaced = false;
        this.interval = 15000;
        this.market = 'BTC-ADA';
        this.orders = [];
        this.lastOrderUuid = '';

        this.timer = setInterval(this.checkPrice.bind(this), this.interval);
    }

    // Hard coding a ping pong here for the first one
    // initPingPong(aMarket) {
    //     this.market = aMarket;
    //     this.fetchCurrencyData(this.market).then((data) => {
    //         console.log(data);
    //         this.currentPrice = data.result.Last;

    //         // this.executeBuy(this.market, 0.005, this.currentPrice).then((data) => {
    //         //     // New entry in database
    //         //     console.log('Buy order placed');
    //         //     console.log(data);
    //         // });
    //     });
    // }

    checkPrice() {

        if (this.orderPlaced) {
            this.fetchOpenOrders(this.market).then((data) => {
                if (data.success && data.result) {
                    if (!this.isOrderOpen(data.result)) {
                        console.log('Order filled');
                        this.isOwned = !this.isOwned;
                        this.orderPlaced = false;
                    } else {
                        // JUST LOGGING HERE
                        this.fetchCurrencyData(this.market).then((data) => {
                            this.currentPrice = data.result.Last;
                            if (this.isOwned) {
                                console.log('Sell order pending. Target sell price: ' + this.sellPrice + '.  Current price: ' + this.currentPrice);
                            } else {
                                console.log('Buy order pending. Target buy price: ' + this.buyPrice + '.  Current price: ' + this.currentPrice);
                            }
                        });
                    }
                }
            });
        } else {
            console.log('No order placed, fetching currency data...');
            // get current price
            this.fetchCurrencyData(this.market).then((data) => {
                this.currentPrice = data.result.Last;
    
                if (this.isOwned) {
                    console.log('Currency is owned, placing sell order at ' + this.sellPrice);                    
                    this.executeSell(this.market, this.quantity, this.sellPrice).then((data) => {
                        if (data.success) {
                            this.orderPlaced = true;
                            this.orders.push({orderType: 'Sell',uuid: data.result.uuid});
                            
                            this.lastOrderUuid = data.result.uuid;

                            console.log('Sell order placed. uuid: ' + data.result.uuid);
                        } else {
                            console.log('ERROR: Could not place Sell order: ', data);
                        }
                    })
                } else {
                    console.log('Currency not owned');
                    if (this.currentPrice <= this.buyPrice) {
                        console.log('Current price <= buy price, placing buy order...');
                        this.executeBuy(this.market, this.quantity, this.currentPrice).then((data) => {
                            if (data.success) {
                                this.orderPlaced = true;
                                this.orders.push({orderType: 'Buy',uuid: data.result.uuid});
                                
                                this.lastOrderUuid = data.result.uuid;

                                this.buyPrice = this.currentPrice;
                                this.sellPrice = this.calculateSellPrice();

                                console.log('Buy order placed. uuid: ' + data.result.uuid);
                            } else {
                                console.log('ERROR: Could not place Buy order: ', data);
                            }
                        });
                    } else {
                        console.log('Current price too high. Buy price: ' + this.buyPrice + '.  Current price: ' + this.currentPrice);
                    }
                }
            });
        }
    }

    calculateSellPrice() {
        return this.buyPrice + (this.buyPrice * this.percentGain);
    }

    isOrderOpen(orders) {
        // check uuid here to confirm that this order is the one that was placed from this controller
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].OrderUuid === this.lastOrderUuid) {
                // Order is still open
                return true;
            }
        }

        return false;
    }
}

module.exports = PingPongController;