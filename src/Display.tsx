import * as React from 'react';
import App from './App.js';
import PriceDisplay from './components/PriceDisplay';
import PriceModel from './data/PriceModel';
import ControlPanel from './components/ControlPanel';
import CurrentBTCPriceDisplay from './components/CurrentBTCPriceDisplay';

export interface Props {
}

export interface State {
    btcLoadingAnimation: any;
    currentBTCPrice: any;
    balances: any;
}

class Display extends React.Component<Props, object>{

    private mPriceModel: PriceModel;

    public state: State = {
        balances: [],
        currentBTCPrice: 0,
        btcLoadingAnimation: false
    }

    constructor(props: Props) {
        super(props);

        this.mPriceModel = new PriceModel();
    }
    
    componentDidMount() {
        // Initialize the view with the data
        this.mPriceModel.fetchData('BTCPrice').then((responseData: any) => {
            this.setState({currentBTCPrice: this.mPriceModel.currentBTCPrice});
            this.mPriceModel.fetchData('balances').then((responseData: any) => {
                this.setState({balances: this.mPriceModel.balances});            
            });
        });
    }

    AbuttonClicked(event: any, aButton: any) {
        if(aButton.endPointKey === 'BTCPrice') {
            this.setState({btcLoadingAnimation: true})
        }

        this.mPriceModel.fetchData(aButton.endPointKey).then((responseData: any) => {
            this.setState({balances: this.mPriceModel.balances});
            this.setState({currentBTCPrice: this.mPriceModel.currentBTCPrice});
            this.setState({btcLoadingAnimation: false})
        });
    }

    render() {
        const btcPriceDisplayArgs = {
            loadingAnimation: this.state.btcLoadingAnimation,
            price: this.state.currentBTCPrice
        },
        priceDisplayArgs = {
            model: this.mPriceModel,
            balances: this.state.balances
        }
        return( 
        <div>
            <ControlPanel {...this.AbuttonClicked.bind(this)} />
            <CurrentBTCPriceDisplay {...btcPriceDisplayArgs}/>
            <PriceDisplay {...priceDisplayArgs}/>
        </div>
        )
    }
}

export default Display;
