import { isMobileApp } from "../game/utils/mobileApp";
import * as React from "react";
import { Action, Event, GameState } from "../models";
import { STORE_ACTION } from "../actions";
import ListItem from "./historyItems/listItem";
import { SortableContainer, SortableElementProps, SortableElement, arrayMove, SortEnd } from 'react-sortable-hoc';

interface ActionListItem extends Action {
    count: number;
    index: number;
}

interface ActionItemContainer {
    action: ActionListItem;
    parent: HistoryList;
}

interface ActionsListContainer {
    items: ActionListItem[];
    parent: HistoryList;
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
    onActionOrderingChanged(oldIndex: number, newIndex: number): void;
}

const SortableItem = SortableElement<ActionItemContainer>(({action, parent}) =>
    <ListItem
        action={action}
        index={action.index}
        count={action.count}
        onChangeStatementCount={(index, newCount) => parent.props.onChangeStatementCount(index, newCount)}
        onRemove={(index) => parent.handleRemove(index)} />
);

const SortableList = SortableContainer<ActionsListContainer>(({ parent, items }) => {
    return (
        <ul className="list-group">
            {items.map((action: ActionListItem, index: number) => (
                <SortableItem key={`item-${action.index}`} index={action.index} action={action} parent={parent} />
            ))}
        </ul>
    );
});

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

    onSortEnd(result: SortEnd) {
        console.log(`[HistoryList] Reorder actions from ${JSON.stringify(result)}`);
        this.props.onActionOrderingChanged(result.oldIndex, result.newIndex);
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
        const history = <SortableList useDragHandle parent={this} items={actionList.items} onSortEnd={(result) => this.onSortEnd(result)} />

        const style: React.CSSProperties = {
            height: "100vh",
            overflow: "auto",
        };

        return <div className="history" data-selector="history" style={style} ref={(ele) => this.historyElement = ele}>
            {history}
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