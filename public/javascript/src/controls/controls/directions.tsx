import * as React from "react";
import { Action, ActionType, Direction, getActionTypeColor, getActionTypeIcon } from "../../models";

interface DirectionProperties {
    actions: ActionType[];
    onMove(action: Action): any;
}

interface DirectionState {
    actionType: ActionType;
}

export default class DirectionControls extends React.Component<DirectionProperties, DirectionState> {
    public constructor() {
        super();
        this.state = { actionType: ActionType.Movement };
    }

    public componentDidMount() {
        this.registerCursors();
    }

    public setActionType(actionType: ActionType) {
        this.setState({ actionType });
    }

    public handleMove(event: any, direction: Direction) {
        this.props.onMove({ direction, type: this.state.actionType, nesting: 0 });
    }

    public render() {
        let left = <button className="btn btn-secondary disabled"></button>;
        let right = <button className="btn btn-secondary disabled"></button>;
        let buttonStyle = getActionTypeColor(ActionType.Movement);
        if (this.props.actions && this.props.actions.length === 2) {
            const first = this.props.actions[0];
            const second = this.props.actions[1];
            left = <button
                data-test={`action ${ActionType[first]}`}
                data-selector={ActionType[first]}
                className={`btn btn-outline-${getActionTypeColor(first)} fa fa-${getActionTypeIcon(first)}`}
                onClick={e => this.setActionType(first)}
                disabled={this.state.actionType === first}></button>;
            right = <button
                data-test={`action ${ActionType[second]}`}
                data-selector={ActionType[second]}
                className={`btn btn-outline-${getActionTypeColor(second)} fa fa-${getActionTypeIcon(second)}`}
                onClick={e => this.setActionType(second)}
                disabled={this.state.actionType === second}></button>;

            buttonStyle = getActionTypeColor(this.state.actionType);
        }

        return <div data-selector="controls" className="btn-group btn-matrix btn-group" role="group">
            {left}
            <button data-test="direction up" data-selector="up" className={`btn btn-lg btn-outline-${buttonStyle} fa fa-arrow-circle-o-up`} onClick={e => this.handleMove(e, Direction.UP)}></button>
            {right}
            <button data-test="direction left" className={`btn btn-lg btn-outline-${buttonStyle} fa fa-arrow-circle-o-left`} onClick={e => this.handleMove(e, Direction.LEFT)}></button>
            <button data-test="direction down" data-selector="down" className={`btn btn-lg btn-outline-${buttonStyle} fa fa-arrow-circle-o-down`} onClick={e => this.handleMove(e, Direction.DOWN)}></button>
            <button data-test="direction right" className={`btn btn-lg btn-outline-${buttonStyle} fa fa-arrow-circle-o-right`} onClick={e => this.handleMove(e, Direction.RIGHT)}></button>
        </div>;
    }

    private registerCursors() {
        const keyDown = (e: any) => {
            const keyCode = e.keyCode;
            switch (keyCode) {
                case 37:
                    this.handleMove(e, Direction.LEFT);
                    break;
                case 38:
                    this.handleMove(e, Direction.UP);
                    break;
                case 39:
                    this.handleMove(e, Direction.RIGHT);
                    break;
                case 40:
                    this.handleMove(e, Direction.DOWN);
                    break;
            }
        };

        document.removeEventListener("keydown", keyDown, false);
        document.addEventListener("keydown", keyDown, false);
    }
}