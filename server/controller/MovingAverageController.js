const BaseController = require('./BaseController');
const OrderManager = require('../utils/OrderManager');

const MS_PER_MINUTE = 1000 * 60;

class MovingAverageController extends BaseController {
    constructor() {
        super();

        this.OrderManager = new OrderManager(this);

        this.isRealMoney = true;

        this.market = 'BTC-XVG';
        this.isOwned = false;

        this.quantity = 100;
        this.balance = 0;
        this.startingBalance = 0;  // Will be set once on initial purchase

        this.averages = {
            fiveMinute: {
                name: "5 minute",
                history: [],
                average: 0,
                length: 24,  // 2 hours
                interval: 15 * 1000
            },
            oneMinute: {
                name: "1 minute",
                history :[],
                average: 0,
                length: 25,  // Pulled this number out of my ass
                interval: 5 * 1000
            }
        }

        //this.history = [];
        this.currentPrice = 0;
        // this.average = 0;
        // this.averageLength = 10;  // Number of "closing" prices to collect for the average
        // this.interval = 5000;

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
        this.startTimers(); 
    }

    startTimers() {
        this.timers = [];

        for (var average in this.averages) {
            let tAvg = this.averages[average],
                tTimer = setInterval(this.tick.bind(this, tAvg), tAvg.interval);

            this.timers.push(tTimer);
        }
    }

    stopTimers() {
        this.timers.forEach((aTimer) => {
            clearInterval(aTimer);
        });
    }

    tick(aMovingAverageObject) {
    // -------- Log --------------
        console.log(' ');
        console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  -');
        console.log('   Request number:        ' + this.requestNumber++);
        console.log('   Time elapsed:          ' + Math.floor((this.requestNumber * aMovingAverageObject.interval) / MS_PER_MINUTE) + ' minutes');
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
        console.log('   Average Price:         ' + aMovingAverageObject.average + '    (of past ' + Math.floor((aMovingAverageObject.interval * aMovingAverageObject.length) / MS_PER_MINUTE) + ' minutes)');
        if (this.isOwned) {
            console.log('   Buy price:             ' + this.buyPrice);
            console.log('   Minimum sell price:    ' + this.minimumSellPrice);
            console.log('   Current profit:        ' + this.calculatePercentReturn() + '%');
        }
        
    // ---------- Begin ----------
        // Set a temporary variable to the object of the Moving Average we are working with
        this.currentMA = aMovingAverageObject;
        this.history = this.currentMA.history;
        
        this.fetchCurrentPrice().then((data) => {
            if (data && data.result && data.result.Last) {
                this.currentPrice = data.result.Last;
                this.history.push(this.currentPrice);
            }
            // Set value of this.average
            this.calculateAverage();
            this.currentMA.average = this.average;
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
     * @sideffects  this.average, this.history
     */
    calculateAverage() {
        let sum = 0;

        if (this.history.length > this.averageLength) {
            this.history.shift();
        } else {
            console.log('Not enough historical data to calculate average. ' + this.history.length + '/' + this.currentMA.length);
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

    /**
     * @description Checks the averages against one another and places Sell/Buy if there is a cross-over
     *              If not owned && 1 minute average crosses above the 5 minute average
     *                  Buy
     *              If owned && 1 minute average crosses below the 5 minute average
     *                  Sell
     */
    checkAverages() {
        if (this.isOwned) {
            this.calculatePercentReturn();
            if (this.averages[oneMinte] < this.averages[fiveMinute]) {
                this.placeSellOrder();
            } else {
                console.log('Short term average is lower than long term average price. Waiting for cross-over.');                
            }
        } else {
            if (this.averages[oneMinte] > this.averages[fiveMinute]) {
                this.placeBuyOrder();
            } else {
                console.log('Currency not owned. Short term average is higher than long term average price. Waiting for cross-over.');
            }
        }
    }

    placeSellOrder() {
        let currentProfit = this.calculatePercentReturn();

        if (this.isRealMoney) {
            this.orderPending = true;
            this.stopTimers();
            this.OrderManager.placeSellAndWaitForFulfillment(this.market, this.quantity, this.currentPrice).then((data) => {
                console.log('Sell order completely complete. Restarting Moving Average timer. Well done');
                this.isOwned = false;
                this.orderPending = false;
                this.startTimers();
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
            // Pause until order is fulfilled then resume timer
            this.stopTimers();
            this.orderPending = true;            
            this.OrderManager.placeBuyAndWaitForFulfillment(this.market, this.quantity, this.currentPrice).then((data) => {
                console.log('Buy order completely complete. Restarting Moving Average timer. Well done');                
                this.isOwned = true;
                this.orderPending = false;
                this.startTimers();
            });
        } else {
            if (!this.startingBalance) {
                this.balance = this.currentPrice * this.quantity;
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