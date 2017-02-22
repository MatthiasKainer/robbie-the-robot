import * as React from 'react';
import TouchSpin from './touchspin';
import { Action, ActionType, Direction, Event, GameState, getActionTypeColor, getActionTypeIcon } from '../models';
import { STORE_ACTION } from '../actions';

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

    historyElement: HTMLDivElement;

    public handleRemove(index: number) {
        this.props.onRemoveStatement(index);
    }

    private reduceHistoricMovements(previous: Action, current: Action, index: number, result: ActionsList) {
        if (previous.direction === current.direction && previous.type === current.type) {
            result.items[result.items.length - 1].count++;
        } else {
            result.items.push({
                count: 1,
                index,
                direction: current.direction,
                type: current.type
            });
        }

        return result;
    }

    public componentDidMount() {
        if (this.props.gameState === GameState.RUNNING)
            this.scrollToTop();
        else
            this.scrollToBotton();
    }

    public componentDidUpdate() {
        if (this.props.gameState === GameState.RUNNING)
            this.scrollToTop();
        else
            this.scrollToBotton();
    }

    private scrollToTop() {
        if (this.props.events &&
            this.props.events.length > 0 &&
            this.props.gameState === GameState.RUNNING)
            this.historyElement.scrollTop = 0;
    }

    private scrollToBotton() {
        if (this.props.events &&
            this.props.events.length > 0 &&
            this.props.events[this.props.events.length - 1].name === STORE_ACTION)
            this.historyElement.scrollTop = this.historyElement.scrollHeight;
    }

    public render() {
        let previous: Action;
        let actionList: ActionsList = { items: [] };
        this.props.actions
            .filter(_ => _ != null)
            .forEach((item, index) => {
                if (!previous) {
                    actionList.items.push({
                        count: 1,
                        index: 0,
                        direction: item.direction,
                        type: item.type
                    });
                }
                else {
                    this.reduceHistoricMovements(previous, item, index, actionList);
                }

                previous = item;
            });
        let history = actionList.items
            .map((action: ActionListItem) => {
                let count: JSX.Element = <span />;
                count = <div>
                    <TouchSpin value={action.count}
                        onNumberChange={(value) => this.props.onChangeStatementCount(action.index, value)}
                        onNumberIncrease={() => this.props.onChangeStatementCount(action.index, action.count + 1)}
                        onNumberDecrease={() => this.props.onChangeStatementCount(action.index, action.count - 1)} />
                </div>;

                return <li className={`list-group-item  list-group-item-${getActionTypeColor(action.type)}`} key={action.index}>
                    {count}
                    <div style={{ fontSize: "3rem" }}>
                        <i className={`fa fa-${getActionTypeIcon(action.type)}`}></i>&nbsp;
                        <i className={`fa fa-arrow-circle-o-${Direction[action.direction].toLowerCase()}`}></i>
                    </div>
                    <div>
                        <i className="fa fa-trash-o" style={{ cursor: "pointer" }} onClick={e => this.handleRemove(action.index)}></i>
                    </div>
                </li>
            });

        let style = {
            height: "50vh",
            overflow: "auto"
        }
        return <div className="history" style={style} ref={(ele) => this.historyElement = ele}>
            <ul className="list-group">
                {history}
            </ul>
        </div>;
    }
}