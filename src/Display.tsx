import * as React from 'react';
import App from './App.js';
import BalancesDisplay from './components/BalancesDisplay';
import PriceModel from './data/PriceModel';
import ControlPanel from './components/ControlPanel';
import CurrentBTCPriceDisplay from './components/CurrentBTCPriceDisplay';
import MakeTradeComponent from './components/MakeTradeComponent';

export interface Props {
}

export interface Balance {
    Available: number;  // these may be booleans
    Balance: number;    // these may be booleans
    CryptoAddress: string;
    Currency: string;
    Pending: number;    // these may be booleans
}

export interface State {
    btcLoadingAnimation: boolean;
    currentBTCPrice: number;
    balances: Balance[];
}

class Display extends React.Component<Props, object>{

    public state: State = {
        balances: [],
        currentBTCPrice: 0,
        btcLoadingAnimation: false
    }
    
    private mPriceModel: PriceModel;

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

            // Dev: for easily viewing the min trade size
            this.mPriceModel.fetchData('getMarkets').then((responseData: any) => {
                console.log(responseData);
            });
        });
    }

    buttonClicked(event: any, aButton: any) {
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
        const controlPanelArgs = {
            buttonClicked: this.buttonClicked.bind(this)
        },
        btcBalancesDisplayArgs = {
            loadingAnimation: this.state.btcLoadingAnimation,
            price: this.state.currentBTCPrice
        },
        priceDisplayArgs = {
            model: this.mPriceModel,
            balances: this.state.balances
        },
        makeTradeArgs = {
            model: this.mPriceModel
        };

        return( 
        <div>
            <ControlPanel {...controlPanelArgs} />
            <CurrentBTCPriceDisplay {...btcBalancesDisplayArgs} />
            <div className="main__main-container">
                <BalancesDisplay {...priceDisplayArgs} />
                <MakeTradeComponent {...makeTradeArgs}/>
            </div>
        </div>
        )
    }
}

export default Display;
