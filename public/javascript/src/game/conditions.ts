import {  GameState, Position } from '../models';

let isOnPosition = function(element : Position, target : Position) {
    return element.column === target.column && element.row === target.row;
}

abstract class Condition {
    gameState: GameState;
    onFullfilled : () => void;

    constructor(state: GameState, onFullfilled : () => void) {
        this.onFullfilled = onFullfilled;
        this.gameState = state;
    }
}

export class WinCondition extends Condition {
    robot : Position;
    goal : Position;

    constructor(goal: Position, robot : Position, state: GameState, onFullfilled : () => void) {
        super(state, onFullfilled);
        this.robot = robot;
        this.goal = goal;
    }

    public isFullfilled() {
        return isOnPosition(this.robot, this.goal) &&
            this.gameState == GameState.STOP;
    }
}