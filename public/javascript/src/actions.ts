import { createAction } from "redux-actions";
import { Action, ChangeCountOfCommand, Map, Robot } from "./models";

export const SET_MAP = "SET_MAP";
export const STORE_ACTION = "STORE_ACTION";
export const REMOVE_STATEMENT = "REMOVE_STATEMENT";
export const CHANGE_STATEMENT_COUNT = "CHANGE_STATEMENT_COUNT";
export const PERFORM_ACTION = "PERFORM_ACTION";
export const UPDATE_ROBOT = "UPDATE_ROBOT";
export const START = "START";
export const STOP = "STOP";
export const DIE = "DIE";
export const WIN = "WIN";

export const setMap = createAction<Map, Map>(
    SET_MAP,
    (map: Map) => map,
);

export const storeAction = createAction<Action, Action>(
    STORE_ACTION,
    (movement: Action) => movement,
);

export const removeStatement = createAction<number, number>(
    REMOVE_STATEMENT,
    (index: number) => index,
);

export const changeStatementCount = createAction<ChangeCountOfCommand, ChangeCountOfCommand>(
    CHANGE_STATEMENT_COUNT,
    (command: ChangeCountOfCommand) => command,
);

export const performAction = createAction<Action, Action>(
    PERFORM_ACTION,
    (movement: Action) => movement,
);

export const updateRobot = createAction<Robot, Robot>(
    UPDATE_ROBOT,
    (robot: Robot) => robot,
);

export const win = createAction(
    WIN,
    () => true,
);

export const startRobot = createAction<boolean>(
    START,
    () => true,
);

export const killRobot = createAction<boolean>(
    DIE,
    () => true,
);

export const stopRobot = createAction<boolean>(
    STOP,
    () => true,
);