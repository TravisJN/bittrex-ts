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
        // this.mModel.fetchData('buyLimit', aOptions);
   }

   public sellLimit(aOptions: MarketOrderOptions): void {
       console.log('Sell limit!', aOptions);
        //this.mModel.fetchData('sellLimit', aOptions);
   }

}

export default MakeTradeUtil;