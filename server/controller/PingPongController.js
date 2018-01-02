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

        this.percentGain = 0.005;  // Minimum percentage profit before any sell order would be placed
        this.buyPrice = Number.MAX_SAFE_INTEGER;
        this.sellPrice = 0;
        this.minimunSellPrice = this.calculateSellPrice();
        this.currentPrice = 0;
        this.quantity = 100;
        this.isOwned = false;
        this.orderPlaced = false;
        this.interval = 10000;
        this.market = 'BTC-NXT';
        this.orders = [];
        this.lastOrderUuid = '';

        this.highPrice = 0;
        this.stopLoss = 0.005;

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
            this.checkOpenOrders();
        } else {
            console.log('No order placed, fetching currency data...');
            // get current price
            this.fetchCurrencyData(this.market).then((data) => {
                this.currentPrice = data.result.Last;
                
                if (this.isOwned) {
                    // Check trailing stop to determine if the sell order should be placed
                    this.setTrailingStop();
                    //this.placeSellOrder();
                } else {
                    console.log('Currency not owned');
                    if (this.currentPrice <= this.buyPrice) {
                        this.placeBuyOrder();
                    } else {
                        console.log('Current price too high. Buy price: ' + this.buyPrice + '.  Current price: ' + this.currentPrice);
                    }
                }
            });
        }
    }

    getPercentGain() {
        return ((this.currentPrice - this.buyPrice) / this.buyPrice).toFixed(4);
    }

    setTrailingStop() {
        if (this.currentPrice > this.highPrice) {
            console.log('New high price: ' + this.currentPrice);
            this.highPrice = this.currentPrice;
            this.sellPrice = this.highPrice - (this.highPrice * this.stopLoss);
        }

        console.log('Currency owned. Percent gain: ' + this.getPercentGain() + '. Current high: ' + this.highPrice + '. Current target sell price: ' + this.sellPrice + '. Current price: ' + this.currentPrice);
        console.log('Current target sell price: ' + this.sellPrice.toFixed(8) + '. Current price: ' + this.currentPrice);
        console.log('minimum sell price: ' + this.minimumSellPrice.toFixed(8));
        console.log((this.sellPrice > this.minimumSellPrice), (this.currentPrice <= this.sellPrice));
        
        if (this.sellPrice > this.minimumSellPrice && this.currentPrice <= this.sellPrice) {
            this.placeSellOrder();
        }
    }

    checkOpenOrders() {
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
    }

    placeSellOrder() {
        console.log('Currency is owned, placing sell order at ' + this.sellPrice);                    
        this.executeSell(this.market, this.quantity, this.sellPrice).then((data) => {
            if (data.success) {
                this.orderPlaced = true;
                this.orders.push({orderType: 'Sell',uuid: data.result.uuid});

                // this.db.insertRow({
                //     id: data.result.uuid,
                //     date: Date.now(),
                //     currency: this.market,
                //     price: this.currentPrice,
                //     type: 'Sell'
                // });

                this.lastOrderUuid = data.result.uuid;

                console.log('Sell order placed. uuid: ' + data.result.uuid);
            } else {
                console.log('ERROR: Could not place Sell order: ', data);
            }
        });
    }

    placeBuyOrder() {
        console.log('Current price <= buy price, placing buy order at ' + this.currentPrice);
        this.executeBuy(this.market, this.quantity, this.currentPrice).then((data) => {
            if (data.success) {
                this.orderPlaced = true;
                this.orders.push({orderType: 'Buy',uuid: data.result.uuid});
                
                // this.db.insertRow({
                //     id: data.result.uuid,
                //     date: Date.now(),
                //     currency: this.market,
                //     price: this.currentPrice,
                //     type: 'Buy'
                // });

                this.lastOrderUuid = data.result.uuid;

                this.buyPrice = this.currentPrice;
                this.minimumSellPrice = this.calculateSellPrice();

                console.log('Buy order placed. uuid: ' + data.result.uuid);
            } else {
                console.log('ERROR: Could not place Buy order: ', data);
            }
        });
    }

    calculateSellPrice() {
        return this.buyPrice + (this.buyPrice * this.stopLoss);
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