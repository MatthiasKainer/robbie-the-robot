import * as React from 'react';
import { Action, ActionType, Direction, GameState, Robot } from '../models';

interface ActProperties {
    gameState: GameState;
    actions: Action[];
    onExecuteAction(action: Action): void;
    onComplete(): void;
    onDied(): void;
}

export default class Act extends React.Component<ActProperties, any> {
    public dead() {
        this.props.onDied();
    }

    public performAction() {
        let { actions, onExecuteAction } = this.props;
        let nextAction = actions.shift();

        setTimeout(() => {
            console.log(`[ACT] execute ${ActionType[nextAction.type]} position callback`);
            try {
                onExecuteAction(nextAction);
            } catch (err) {
                console.error("oh no - i'm dead! I died because: ");
                console.error(err);
                this.dead();
            }
        }, 1200);
    }

    public done() {
        this.props.onExecuteAction({ type : ActionType.End, direction : Direction.DOWN });
        this.props.onComplete();
    }

    public render() {
        console.log(`[ACT] render`);
        if (this.props.gameState === GameState.RUNNING && this.props.actions.length > 0) {
            console.log(`[ACT] executing ${this.props.actions.length} actions`);
            this.performAction();
        } else if (this.props.gameState === GameState.RUNNING) {
            this.done();
        }

        return <input type="hidden" />
    }
}