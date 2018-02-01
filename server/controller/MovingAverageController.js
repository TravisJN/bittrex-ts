const BaseController = require('./BaseController');

const MS_PER_MINUTE = 1000 * 60;

class MovingAverageController extends BaseController {
    constructor() {
        super();

        this.isRealMoney = false;

        this.market = 'BTC-ETH';
        this.isOwned = false;

        this.quantity = 10;
        this.balance = 0;
        this.startingBalance = 0;  // Will be set once on initial purchase

        this.history = [];
        this.currentPrice = 0;
        this.average = 0;
        this.averageLength = 10;  // Number of "closing" prices to collect for the average
        this.interval = 1 * MS_PER_MINUTE;

        this.profitHistory = [];

        this.minimumProfit = 0.01; // minimum gain in value before a sell order can be placed
        this.minimumSellPrice = Number.MAX_SAFE_INTEGER;

        this.requestNumber = 1;
        this.sellCount = 0;
        this.lossCount = 0;
        this.profitCount = 0;

        this.largestProfit = 0;
        this.largestLoss = 0;

        this.orders = [];

        /**
         * UNCOMMENT THIS LINE TO INIT TRADE WITH ABOVE SETTINGS
         */
        // this.init(); 
    }

    init() {
        this.timer = setInterval(this.tick.bind(this), this.interval);
    }

    tick() {
    // -------- Log --------------
        console.log(' ');
        console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  -');
        console.log('   Request number:        ' + this.requestNumber++);
        console.log('   Time elapsed:          ' + Math.floor((this.requestNumber * this.interval) / MS_PER_MINUTE) + ' minutes');
        console.log('   Currency:              ' + this.market);
        console.log('   Starting Acount Value: ' + this.startingBalance + ' BTC');
        console.log('   Total Account Value:   ' + this.balance + ' BTC');
        console.log('   Total Percent gain:    ' + ((this.balance - this.startingBalance) / this.startingBalance).toFixed(4) * 100 + '%');
        console.log('   - - - - - - - - - - - - - - - - - - - - -');
        console.log('   Number of Sells:       ' + this.sellCount + '   ( +' + this.profitCount + ' / -' + this.lossCount + ' )');
        console.log('   Largest Profit:        ' + this.largestProfit);
        console.log('   Largest Loss:          ' + this.largestLoss);
        console.log('   - - - - - - - - - - - - - - - - - - - - -');
        console.log('   Currency Owned:        ' + this.isOwned);
        console.log('   Current price:         ' + this.currentPrice);
        console.log('   Average Price:         ' + this.average + '    (of past ' + Math.floor((this.interval * this.averageLength) / MS_PER_MINUTE) + ' minutes)');
        if (this.isOwned) {
            console.log('   Buy price:             ' + this.buyPrice);
            console.log('   Minimum sell price:    ' + this.minimumSellPrice);
            console.log('   Current profit:        ' + this.calculatePercentReturn() + '%');
        }
        
    // ---------- Begin ----------
        this.fetchCurrentPrice().then((data) => {
            if (data && data.result && data.result.Last) {
                this.currentPrice = data.result.Last;
                this.history.push(this.currentPrice);
            }
            // Set value of this.average
            this.calculateAverage();

            if (this.average) {
                this.checkAverageAgainstCurrentPrice();
            } 
        });
    }

    /**
     * @description will fetch the latest price and add it to the history array used for calculating averages
     */
    fetchCurrentPrice() {
        return this.fetchCurrencyData(this.market).then((data) => {
            return data;
        });
    }

    /**
     * @description Sets this.average by calculating the average of the history array
     * @returns     void
     * @sideffects  this.average
     */
    calculateAverage() {
        let sum = 0;

        if (this.history.length > this.averageLength) {
            this.history.shift();
        } else {
            console.log('Not enough historical data to calculate average. ' + this.history.length + '/' + this.averageLength);
            this.average = 0;
            return;
        }

        sum = this.history.reduce((aTotal, aValue) => {
            return aTotal + aValue;
        });

        this.average = sum / this.history.length;
    }

    /**
     * @description Checks the current average against the most recent price and determines if a buy/sell should be placed
     */
    checkAverageAgainstCurrentPrice() {
        if (this.isOwned) {
            this.calculatePercentReturn();
            // check if the current price is less than the moving average and sell
            if (this.average > this.currentPrice) {
                this.placeSellOrder();
            } else {
                console.log('Current price is more than average price. Waiting for cross-over.');                
            }
        } else {
            if (this.average < this.currentPrice) {
                this.placeBuyOrder();
            } else {
                console.log('Currency not owned. Current price is less than average price. Waiting for cross-over.');
            }
        }
    }

    placeSellOrder() {
        let currentProfit = this.calculatePercentReturn();

        if (this.isRealMoney) {
            console.log('Placing sell order at ' + this.sellPrice);                    
            this.executeSell(this.market, this.quantity, this.sellPrice).then((data) => {
                if (data.success) {
                    this.orderPlaced = true;
                    this.orders.push({
                        orderType: 'Sell',
                        uuid: data.result.uuid,
                        price: this.currentPrice
                    });

                    this.lastOrderUuid = data.result.uuid;

                    console.log('Sell order placed. uuid: ' + data.result.uuid);
                } else {
                    console.log('ERROR: Could not place Sell order: ', data);
                }
            });

        } else {
            if (this.currentPrice > ((this.buyPrice * this.minimumProfit) + this.buyPrice)) {
                this.balance = this.quantity * this.currentPrice;
                this.sellCount++;
                // Place sell
                console.log('---------------------------------------------------------------------------------');            
                console.log('====Cross-over occurred! Current price less than average price. Place sell.======');                
                this.isOwned = false;
                this.sellPrice = this.currentPrice;
                if (currentProfit > 0) {
                    if (currentProfit > this.largestProfit) {
                        this.largestProfit = currentProfit;
                    }
                    this.profitCount++;
                }  else {
                    if (currentProfit < this.largestLoss) {
                        this.largestLoss = currentProfit;
                    }
                    this.lossCount++;
                }
                this.history = [];
                this.average = 0;
            } else {
                console.log("Cross-over occurred but minimum price (" + this.minimumSellPrice + ") not reached."); 
            }
        }
    }

    
    placeBuyOrder() {

        if (this.isRealMoney) {
            this.executeBuy(this.market, this.quantity, this.currentPrice).then((data) => {
                if (data.success) {
                    this.orderPlaced = true;
                    this.orders.push({
                        orderType: 'Buy',
                        uuid: data.result.uuid,
                        price: this.currentPrice
                    });

                    this.lastOrderUuid = data.result.uuid;
                    this.buyPrice = this.currentPrice;
    
                    console.log('Buy order placed. uuid: ' + data.result.uuid);
                } else {
                    console.log('ERROR: Could not place Buy order: ', data);
                }
            });
        } else {
            if (!this.startingBalance) {
                this.balance = this.currentPrice * this.quantity;  // quantity is initialized to 10
                this.startingBalance = this.balance;
            } else {   
                this.quantity = this.balance / this.currentPrice;        
            }

            // Place buy?
            console.log('==================================================================================================');
            console.log('==============Cross-over occurred! Current price greater than average price. Place buy.===========');
            this.isOwned = true;
            this.buyPrice = this.currentPrice;
            this.history = [];
            this.average = 0;
            this.minimumSellPrice = (this.buyPrice * this.minimumProfit) + this.buyPrice;
        }
    }

    calculatePercentReturn() {
        let profit = ((this.currentPrice - this.buyPrice) / this.buyPrice).toFixed(6);
        return profit;
    }
}

module.exports = MovingAverageController;