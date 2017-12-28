import React from 'react';
import PriceModel from '../data/PriceModel';
import MakeTradeUtil from '../utils/MakeTradeUtil';

export interface Props {
    model: PriceModel;   
}

export interface State {
    market: string;
    quantity: number;
    rate: number;
}

class MakeTradeComponent extends React.Component<Props, object>{
    private mPriceModel: PriceModel;

    private mTradeUtil: MakeTradeUtil;

    public state: State = {
                            market: "",
                            quantity: 0,
                            rate: 0
                        }

    constructor(props: Props) {
        super(props);

        this.mPriceModel = this.props.model;
        this.mTradeUtil = new MakeTradeUtil(this.mPriceModel);
    }

    // private handleSubmit(aEvent: React.FormEvent<HTMLFormElement>): void {
    //     aEvent.preventDefault();
        
    //     //this.setState({market: aEvent.currentTarget.value});
        
    //     console.log(this.state);
    //     this.mTradeUtil.buyLimit({market: this.state.market, quantity: this.state.quantity, rate: this.state.rate});
    //     //this.mPriceModel.fetchData('buyLimit', {market: this.state.market, quantity: this.state.quantity, rate: this.state.rate})
    //     // Call place buy on PriceModel
    // }

    private handleBuy(aEvent: React.FormEvent<HTMLFormElement>): void {
        aEvent.preventDefault();
        this.mTradeUtil.buyLimit({market: this.state.market, quantity: this.state.quantity, rate: this.state.rate});
    }

    private handleSell(aEvent: React.FormEvent<HTMLFormElement>): void {
        aEvent.preventDefault();
        this.mTradeUtil.sellLimit({market: this.state.market, quantity: this.state.quantity, rate: this.state.rate});
    }

    private handleChange(aEvent: React.FormEvent<HTMLFormElement>): void {
        this.setState({[aEvent.currentTarget.name]: aEvent.currentTarget.value});
    }

    getForm(): JSX.Element {
        return (
            <div className="make-trade__container">
                <form className="make-trade__form">
                    <input  className="make-trade__input"
                            type="text" 
                            name="market" 
                            id="market" 
                            value={this.state.market} 
                            onChange={this.handleChange.bind(this)} />
                    <input  className="make-trade__input"
                            type="text" 
                            name="quantity" 
                            value={this.state.quantity} 
                            onChange={this.handleChange.bind(this)} />
                    <input  className="make-trade__input"
                            type="text" 
                            name="rate" 
                            value={this.state.rate} 
                            onChange={this.handleChange.bind(this)} />
                    <input  type="submit" 
                            value="Place Buy Order" 
                            onClick={this.handleBuy.bind(this)} />
                    <input  type="submit" 
                            value="Place Sell Order" 
                            onClick={this.handleSell.bind(this)} />
                </form>
                <p>1:Market  2:Quantity  3:Rate</p>
            </div>
        )
    }

    render() {
        return (
            <div className="div-trade-component-container">
                {this.getForm()}
            </div>
        )
    }
}

export default MakeTradeComponent;