
class OrderManager {
    constructor() {
        /**
         * The idea here is to have a utility class that will be used to place orders.
         * OrderManager will be responsible for calling the actual executeSell()/executeBuy()
         * calls on BaseController and will manage those orders through to fulfillment.
         * It will poll the API frequently to check if the order has been filled.
         * Upon fulfillment, OrderManager will notify the controller that placed the order
         * either via callback or promise return
         */
    }
}

module.exports = OrderManager;