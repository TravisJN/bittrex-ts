import { setInterval } from 'timers';

const BaseController = require('./BaseController');

const MS_PER_MINUTE = 1000 * 60;

class MovingAverageController extends BaseController {
    constructor() {
        super();

        this.market = '';
        this.isOwned = false;

        this.history = [];
        this.average = 0;
        this.averageLength = 10;  // Number of "closing" prices to collect for the average
        this.interval = 5 * MS_PER_MINUTE;  // 5 minutes
    }

    init() {
        this.timer = setInterval(this.fetchCurrentPrice.bind(this), this.interval);
    }

    /**
     * @description will fetch the latest price and add it to the history array used for calculating averages
     */
    fetchCurrentPrice() {
        this.fetchCurrencyData(this.market).then((data) => {
            this.history.push(data.result.Last);
        });
    }

    calculateAverage() {
        let sum = 0;

        if (this.history.length > this.averageLength) {
            this.history.shift();
        } else {
            console.log('Not enough historical data to calculate average. ' + this.history.length + '/' + this.averageLength);
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
        
    }
}

module.exports = MovingAverageController;