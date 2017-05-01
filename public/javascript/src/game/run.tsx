import * as React from "react";
import { Action, ActionType, Direction, GameState, Robot } from "../models";

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
        const { actions, onExecuteAction } = this.props;
        const nextAction = actions.shift();

        const timer = setTimeout(() => {
            console.log(`[ACT] execute ${ActionType[nextAction.type]} position callback for ${Direction[nextAction.direction]} and timer ${timer}`);
            try {
                onExecuteAction(nextAction);
            } catch (err) {
                console.error("oh no - i'm dead! I died because: ");
                console.error(err);
                this.dead();
            }
        }, 1200);
        console.log(`[ACT] registering ${ActionType[nextAction.type]} for ${Direction[nextAction.direction]} execution in timer ${timer}`);
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

        return <input type="hidden" />;
    }
}