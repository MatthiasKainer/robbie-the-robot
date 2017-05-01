import { GameState, Position } from "../models";

const isOnPosition = function (element: Position, target: Position) {
    return element.column === target.column && element.row === target.row;
};

abstract class Condition {
    public gameState: GameState;
    public onFullfilled: () => void;

    constructor(state: GameState, onFullfilled: () => void) {
        this.onFullfilled = onFullfilled;
        this.gameState = state;
    }
}

export class WinCondition extends Condition {
    public robot: Position;
    public goal: Position;

    constructor(goal: Position, robot: Position, state: GameState, onFullfilled: () => void) {
        super(state, onFullfilled);
        this.robot = robot;
        this.goal = goal;
    }

    public isFullfilled() {
        return isOnPosition(this.robot, this.goal) &&
            this.gameState === GameState.STOP;
    }
}