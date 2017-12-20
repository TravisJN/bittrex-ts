import React from 'react';
import PriceModel from '../data/PriceModel';

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

    public state: State = {
                            market: "",
                            quantity: 0,
                            rate: 0
                        }

    constructor(props: Props) {
        super(props);

        this.mPriceModel = this.props.model;
    }

    private handleSubmit(aEvent: React.FormEvent<HTMLFormElement>): void {
        aEvent.preventDefault();
        
        //this.setState({market: aEvent.currentTarget.value});
        
        console.log(this.state);

        this.mPriceModel.fetchData('buyLimit', {market: this.state.market, quantity: this.state.quantity, rate: this.state.rate})
        // Call place buy on PriceModel
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
                            value="Make Trade" 
                            onClick={this.handleSubmit.bind(this)} />
                </form>
                <p>Clicking submit will attempt to place a Buy order for 0.05 BTC at the current market rate of the symbol entered in the text input box</p>
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