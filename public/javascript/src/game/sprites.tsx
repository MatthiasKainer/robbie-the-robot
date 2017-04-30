import * as React from 'react';
import { ActionType, Direction, GameState, Map, Position, Robot } from '../models';

let isOnPosition = function (element: Position, target: Position) {
    return element.column === target.column && element.row === target.row;
}

export abstract class Sprite {
    position: Position;

    constructor(position: Position) {
        this.position = position;
    }

    public isOnPosition(position: Position) {
        return isOnPosition(this.position, position);
    }

    public break() { return false; }

    abstract getElement(key: string): JSX.Element;
}

export class GoalSprite extends Sprite {
    gameState: GameState;
    robot: Position;

    constructor(position: Position, robot: Position, state: GameState) {
        super(position);
        this.robot = robot;
        this.gameState = state;
    }

    public break() { return true; }

    public getElement(key: string): JSX.Element {
        return isOnPosition(this.robot, this.position) ?
            <div key={key} className="sprite loop goal success"></div> :
            <div key={key} className="sprite loop goal idle"></div>;
    }
}

function calculatePosition(current: Position, direction: Direction) {
    let position: Position = {
        row: current.row,
        column: current.column
    }
    switch (direction) {
        case Direction.DOWN:
            position.row++; break;
        case Direction.UP:
            position.row--; break;
        case Direction.LEFT:
            position.column--; break;
        case Direction.RIGHT:
            position.column++; break;
    }
    return position;
}

export class ExplosionSprite extends Sprite {
    robot: Robot;

    constructor(robot: Robot) {
        super(calculatePosition(robot.position, robot.currentAction ? robot.currentAction.direction : null));
        this.robot = robot;
    }

    public getElement(key: string): JSX.Element {
        setTimeout(() => {
            let elements = document.querySelectorAll('.exploder');
            for (let i = 0; i < elements.length; i++) {
                let element = elements[i];
                element.classList.add("explosion");
            }
        }, 50);
        return (this.robot.currentAction && this.robot.currentAction.type === ActionType.Attack)
            ? <div key={key} className={`sprite exploder`}></div>
            : null;
    }
}

export class RobotSprite extends Sprite {
    gameState: GameState;
    action: ActionType;

    constructor(position: Position, state: GameState, action: ActionType) {
        super(position);
        this.gameState = state;
        this.action = action;
    }

    public getElement(key: string): JSX.Element {
        switch (this.gameState) {
            case GameState.RUNNING:
                if (this.action === ActionType.Movement)
                    return <div key={key} className="sprite loop robot run"></div>;
                else
                    return <div key={key} className="sprite loop robot tool"></div>
            case GameState.LOOSE:
                return <div key={key} className="sprite once robot die"></div>;
            case GameState.STOP:
                return <div key={key} data-test="robot" className="sprite loop robot idle"></div>;
        }

        return <div className="sprite loop robot idle"></div>;
    }
}

export class FieldSprite extends Sprite {
    name: string;
    durability: number;
    constructor(name: string, position: Position, durability: number) {
        super(position);
        this.name = name;
        this.durability = durability;
    }

    public getElement(key: string): JSX.Element {
        return <div key={key} className={`sprite ground ${this.name} durability-${this.durability}`}></div>;
    }
}