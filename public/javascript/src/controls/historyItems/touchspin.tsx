import { isMobileApp } from "../../game/utils/mobileApp";
import * as React from "react";

interface TouchSpinProperties {
    value: number;
    onNumberIncrease: () => void;
    onNumberDecrease: () => void;
    onNumberChange: (value: number) => void;
}

export default class TouchSpin extends React.Component<TouchSpinProperties, any> {
    public render() {
        return <div className="input-group input-group-sm">
            <span className="input-group-btn">
                <button className="btn btn-info" type="button" onClick={() => this.props.onNumberDecrease()}>-</button>
            </span>
            <input type="text" value={this.props.value} className="form-control text-center" onChange={(e) => this.onNumberChange(e.target.value)} />
            <span className="input-group-btn">
                <button className="btn btn-info" type="button" onClick={() => this.props.onNumberIncrease()}>+</button>
            </span>
        </div>;
    }

    private onNumberChange(value: any) {
        this.props.onNumberChange(Number.isNaN(value) ? 0 : Number.parseInt(value));
    }
}