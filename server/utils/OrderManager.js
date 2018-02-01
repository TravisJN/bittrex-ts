
class OrderManager {

    constructor(aController) {
        
        /**
         * The idea here is to have a utility class that will be used to place orders.
         * OrderManager will be responsible for calling the actual executeSell()/executeBuy()
         * calls on BaseController and will manage those orders through to fulfillment.
         * It will poll the API frequently to check if the order has been filled.
         * Upon fulfillment, OrderManager will notify the controller that placed the order
         * either via callback or promise return
         */
        this.POLL_INTERVAL = 1000;

        this.parentController = aController;
        this.orders = [];
        this.market = "";
        this.lastOrderUuid = "";
        this.orderPlaced = false;
        this.currentPrice = 0;

        this.pollTimer = null; 
    }

    placeBuyAndWaitForFulfillment(aMarket, aQuantity, aRate) {
        this.market = aMarket;

        return new Promise((resolve, reject) => {
            // I don't really know the best way to handle resolving this promise so maybe this?
            this.resolvePromise = resolve;

            this.parentController.executeBuy(aMarket, aQuantity, aRate).then((data) => {
                if (data.success) {
                    this.orderPlaced = true;
                    this.orders.push({
                        orderType: 'Buy',
                        uuid: data.result.uuid,
                        price: aRate
                    });

                    this.lastOrderUuid = data.result.uuid;

                    this.pollForFullfillment();
                    
                    console.log('Buy order placed at ' + aRate);
                } else {
                    console.log('ERROR: Could not place Buy order: ', data);
                }
            });
        });
    }

    placeSellAndWaitForFulfillment(aMarket, aQuantity, aRate) {
        this.market = aMarket;

        return new Promise((resolve, reject) => {
            // I don't really know the best way to handle resolving this promise so maybe this?
            this.resolvePromise = resolve;

            this.parentController.executeSell(aMarket, aQuantity, aRate).then((data) => {
                if (data.success) {
                    this.orderPlaced = true;
                    this.orders.push({
                        orderType: 'Sell',
                        uuid: data.result.uuid,
                        price: aRate
                    });

                    this.lastOrderUuid = data.result.uuid;

                    this.pollForFullfillment();

                    console.log('Sell order placed at ' + aRate);
                } else {
                    console.log('ERROR: Could not place Sell order: ', data);
                }
            });
        });
    }

    pollForFullfillment() {
        this.pollTimer = setTimeout(this.fetchOpenOrders.bind(this), this.POLL_INTERVAL);        
    }

    fetchOpenOrders() {
        console.log('----------- ------ ---  - - - -  ---  ----------')
        console.log('polling for fulfillment of order: ', this.orders[this.orders.length - 1]);
        this.parentController.fetchOpenOrders(this.market).then((data) => {
            if (data.success && data.result) {
                if (!this.isOrderOpen(data.result, this.lastOrderUuid)) {
                    console.log('Order filled');
                    this.isOwned = !this.isOwned;
                    this.orderPlaced = false;
                    this.resolvePromise();
                } else {
                    console.log('Order still open');
                    this.pollForFullfillment();                            
                }
            } else {
                console.log('Error occurred in fetchOpenOrders() in OrderManager', data);
                this.pollForFullfillment();            
            }
        }); 
    }

    isOrderOpen(orders, uuid) {
        // check uuid here to confirm that this order is the one that was placed from this controller
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].OrderUuid === uuid) {
                // Order is still open
                return true;
            }
        }

        return false;
    }
}

module.exports = OrderManager;