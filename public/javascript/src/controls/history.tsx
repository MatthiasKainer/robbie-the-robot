import { isMobileApp } from "../game/utils/mobileApp";
import * as React from "react";
import { Action, Event, GameState } from "../models";
import { STORE_ACTION } from "../actions";
import ListItem from "./historyItems/listItem";

interface ActionListItem extends Action {
    count: number;
    index: number;
}

interface ActionsList {
    items: ActionListItem[];
}

interface HistoryProperties {
    actions: Action[];
    gameState: GameState;
    events: Event[];
    onChangeStatementCount(index: number, value: number): void;
    onRemoveStatement(index: number): any;
}

export default class HistoryList extends React.Component<HistoryProperties, any> {

    private historyElement: HTMLDivElement;

    public handleRemove(index: number) {
        this.props.onRemoveStatement(index);
    }

    public componentDidMount() {
        if (this.props.gameState === GameState.RUNNING) {
            this.scrollToTop();
        } else {
            this.scrollToBotton();
        }
    }

    public componentDidUpdate() {
        if (this.props.gameState === GameState.RUNNING) {
            this.scrollToTop();
        } else {
            this.scrollToBotton();
        }
    }

    public render() {
        let previous: Action;
        const actionList: ActionsList = { items: [] };
        this.props.actions
            .filter(_ => _ != null)
            .forEach((item, index) => {
                if (!previous) {
                    actionList.items.push({
                        count: 1,
                        index: 0,
                        direction: item.direction,
                        type: item.type,
                    });
                } else {
                    this.reduceHistoricMovements(previous, item, index, actionList);
                }

                previous = item;
            });
        const history = actionList.items
            .map((action: ActionListItem) => <ListItem
                    action={action}
                    index={action.index}
                    count={action.count}
                    onChangeStatementCount={(index, newCount) => this.props.onChangeStatementCount(index, newCount)}
                    onRemove={(index) => this.handleRemove(index)} />);

        const style: React.CSSProperties = {
            height: "100vh",
            overflow: "auto",
        };

        return <div className="history" style={style} ref={(ele) => this.historyElement = ele}>
            <ul className="list-group">
                {history}
            </ul>
        </div>;
    }

    private scrollToTop() {
        if (this.props.events &&
            this.props.events.length > 0 &&
            this.props.gameState === GameState.RUNNING) {
            this.historyElement.scrollTop = 0;
        }
    }

    private scrollToBotton() {
        if (this.props.events &&
            this.props.events.length > 0 &&
            this.props.events[this.props.events.length - 1].name === STORE_ACTION) {
            this.historyElement.scrollTop = this.historyElement.scrollHeight;
        }
    }

    private reduceHistoricMovements(previous: Action, current: Action, index: number, result: ActionsList) {
        if (previous.direction === current.direction && previous.type === current.type) {
            result.items[result.items.length - 1].count++;
        } else {
            result.items.push({
                count: 1,
                index,
                direction: current.direction,
                type: current.type,
            });
        }

        return result;
    }
}