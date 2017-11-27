import * as React from 'react';


export interface Props {
    // this is also in Display.tsx but I didn't know how to reference it here    
    buttonClicked: any;    
}

/**
 * @description This component builds a group of buttons to be displayed at the top of the application
 */
class ControlPanel extends React.Component<Props, any> {
    // This array is used to build the group of buttons
    // label: The string displayed on the button element
    // endPointKey: the key to be used with the endPointKey map in PriceModel
    buttons = [
        {
            label: 'Get Balances',
            endPointKey: 'balances'
        },
        {
            label: 'Get Current BTC Price',
            endPointKey: 'BTCPrice'
        }
    ]

    public buttonClicked: any;

    constructor(props: Props) {
        super(props);

        this.buttonClicked = props.buttonClicked;
    }

    public setState(a:any, b:any) {
        super.setState(a, b);
    }

    getButtons() {
        return this.buttons.map((aButton) => {
            return <button key={aButton.endPointKey} type="button" onClick={this.getButtonCallback(aButton)}>{aButton.label}</button>
        });
    }

    getButtonCallback(aButtonObj: any) {
        return (event) => {
            this.props.buttonClicked(event, aButtonObj);
        }
    }

    render() {
        return (
            <div className="div-control-panel">
                {this.getButtons()}
            </div>
        )
    }
}

export default ControlPanel;