import React from 'react';
import PriceModel from '../data/PriceModel';

interface MarketOrderOptions {
    market: string;
    quantity: number;
    rate: number;
}

class MakeTradeUtil {
    private mModel: PriceModel;

    constructor(aModel: PriceModel) {
        this.mModel = aModel;
   }

   public buyLimit(aOptions: MarketOrderOptions): void {
        console.log('Buy Limit!', aOptions);
        this.mModel.fetchData('buyLimit', aOptions);
   }

   public sellLimit(aOptions: MarketOrderOptions): void {
       console.log('Sell limit!', aOptions);
        this.mModel.fetchData('sellLimit', aOptions);
   }

   private setTrailingStop(aOptions: MarketOrderOptions) {
       // Need to save to a db/json file for persistence
       // Write the current market price on an interval
       // Check if current market price is more than x% below high
       // sell if stop loss is hit or
       // check if latest value is higher than the current high and adjust
       console.log('set trailing stop called')
   }
}

export default MakeTradeUtil;