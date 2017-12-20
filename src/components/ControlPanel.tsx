import * as React from 'react';


export interface Props {
    buttonClicked: (aEvent: any, aButton: any) => void;    
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

    constructor(props: Props) {
        super(props);
    }

    public setState(a:any, b:any) {
        super.setState(a, b);
    }

    private getButtons() {
        return this.buttons.map((aButton) => {
            let buttonArgs = {
                key: aButton.endPointKey,
                tyoe: "button",
                onClick: this.getButtonCallback(aButton)
            };

            return <button {...buttonArgs}>{aButton.label}</button>
        });
    }

    private getButtonCallback(aButtonObj: any) {
        return (event) => {
            this.props.buttonClicked(event, aButtonObj);
        }
    }

    public render() {
        return (
            <div className="div-control-panel">
                {this.getButtons()}
            </div>
        )
    }
}

export default ControlPanel;