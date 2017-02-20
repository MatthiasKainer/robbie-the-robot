export interface Position {
    row: number;
    column: number;
}

export interface Goal {
    position: Position;
};


export enum Way {
    Click,
    Code
}

export interface Robot {
    position: Position;
    currentAction? : Action;
};

export enum ActionType {
    Movement,
    Attack,
    End
}

export function getActionTypeColor(type : ActionType) {
    let icon = "success";
    switch (type) {
        case ActionType.Attack:
            icon = "warning";
            break;
    }

    return icon;
}

export function getActionTypeIcon(type: ActionType) {
    let icon = "arrows";
    switch (type) {
        case ActionType.Attack:
            icon = "rocket";
            break;
    }

    return icon;
}

export enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

export enum GameState {
    STOP,
    RUNNING,
    WIN,
    LOOSE
}

export interface Action {
    type: ActionType;
    direction: Direction;
};

export enum Stars {
    ONE,
    TWO,
    THREE,
    FOUR,
    FIVE
}

export type MapGoal = {
    stars: Stars,
    moves: number,
    runs: number
}

export type Field = {
    sprite: string,
    position: Position,
    durability?: number
}

export type Map = {
    key: string,
    name: string,
    template: string,
    size: Position,
    maxStars: Stars,
    goals: MapGoal[],
    fields: Field[],
    actions?: ActionType[]
}

export type Event = {
    name: string,
    body: any
}

export interface IState {
    actions?: Action[],
    robot?: Robot,
    goal?: Goal,
    map?: Map,
    gameState?: GameState,
    events?: Event[]
};