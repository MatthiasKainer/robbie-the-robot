import TouchSpin from "../touchspin";
import { Action, ActionType, Direction, getActionTypeColor, getActionTypeIcon } from "../../models";
import * as React from "react";
import { Menu, MenuItemDivider, MenuItemLink } from "./menu";

interface ListItemProperty {
    index: number;
    count: number;
    action: Action;
    onChangeStatementCount: (index: number, newCount: number) => void;
    onRemove: (index: number) => void;
}

export default class ListItem extends React.Component<ListItemProperty, any> {

    public render() {
        const { action, index, count } = this.props;
        let spinner: JSX.Element = <span />;
        spinner = <TouchSpin value={count}
            onNumberChange={(value) => this.props.onChangeStatementCount(index, value)}
            onNumberIncrease={() => this.props.onChangeStatementCount(index, count + 1)}
            onNumberDecrease={() => this.props.onChangeStatementCount(index, count - 1)} />;

        return <li className={`list-group-item container list-group-item-${getActionTypeColor(action.type)}`} key={index}>
            <div className="row">
                <div className="col-2" style={{ whiteSpace: "nowrap" }}>
                    {this.getIcon(action)}
                </div>
                <div className="col-8">
                    {spinner}
                </div>
                <div className="col-1">
                    <Menu items={[
                        new MenuItemLink(
                            <span><i className="fa fa-trash-o" /></span>,
                            e => this.props.onRemove(index)),
                    ]} />
                </div>
            </div>
        </li>;
    }

    private getIcon(action: Action) {
        return <span>
            <i className={`fa fa-${getActionTypeIcon(action.type)}`}></i>&nbsp;
            <i className={`fa fa-arrow-circle-o-${Direction[action.direction].toLowerCase()}`}></i>
        </span>;
    }
}