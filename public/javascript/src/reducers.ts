import { ParsingService, WordService } from "./ast/parser";
import {
    AnyValueNode,
    AssignmentNode,
    CallFunctionNode,
    FunctionNode,
    NumberNode,
    StringNode,
} from "./ast/availableNodes";
import { handleActions, Action } from "redux-actions";
import {
    Action as RobotAction,
    ActionType,
    ChangeCountOfCommand,
    ChangeOrderOfCommand,
    Direction,
    GameState,
    IState,
    Map,
    Robot,
} from "./models";
import {
    CHANGE_STATEMENT_COUNT,
    CHANGE_STATEMENT_ORDER,
    DIE,
    PERFORM_ACTION,
    REMOVE_STATEMENT,
    SET_MAP,
    START,
    STOP,
    STORE_ACTION,
    UPDATE_ROBOT,
    WIN,
} from "./actions";
import RobotProcessor from "./game/robot/processor";

const initialState: IState = {
    actions: [],
    gameState: GameState.STOP,
    robot: {
        position: { row: 0, column: 0 },
    },
    goal: {
        position: { row: 0, column: 0 },
    },
    map: {
        key: "",
        name: "",
        template: "",
        maxStars: 0,
        goals: [],
        size: {
            row: 0,
            column: 0,
        },
        fields: [],
    },
    events: [],
};

export default handleActions<IState, Action<any>>({
    [SET_MAP]: (state: IState, action: Action<any>)=> {
        console.log(`Map set to ${JSON.stringify(action.payload)}`);
        return {
            gameState: state.gameState,
            actions: state.actions,
            map: {...action.payload},
            robot: state.robot,
            goal: state.goal,
            events: [...state.events, { name: SET_MAP, body: action.payload }],
        };
    },
    [STORE_ACTION]: (state: IState, action: Action<any>): IState => {
        console.log(`Appending action ${action.payload}`);
        if (!action.payload) {
            return state;
        }

        return {
            gameState: state.gameState,
            actions: [...state.actions, action.payload],
            map: state.map,
            robot: state.robot,
            goal: state.goal,
            events: [...state.events, { name: STORE_ACTION, body: action.payload }],
        };
    },
    [PERFORM_ACTION]: (state: IState, action: Action<any>): IState => {
        console.log(`Performing action ${ActionType[action.payload.type]} in direction ${Direction[action.payload.direction]}`);
        const robotProcessor = new RobotProcessor(state.map, state.robot);
        const robotAction = action.payload;

        let { robot, map } = state;
        switch (robotAction.type) {
            case ActionType.Movement:
                robot = robotProcessor.runNode(new ParsingService(
                    WordService
                        .create(`then move in the direction ${Direction[robotAction.direction].toLowerCase()}`))
                    .parse(), ActionType.Movement);
                robot.currentAction = robotAction;
                console.log(`Moving robot to field ${JSON.stringify(robot.position)}`);
                break;
            case ActionType.Dig:
                const fieldUnderAttack = robotProcessor.runNode(new ParsingService(
                    WordService
                        .create(`then attack in the direction ${Direction[robotAction.direction].toLowerCase()}`))
                    .parse(), ActionType.Dig);
                console.log(`Attacking field ${JSON.stringify(fieldUnderAttack)}`);
                robot = Object.assign({}, robot);
                robot.currentAction = robotAction;
                for (let i = 0; i < map.fields.length; i++) {
                    if (map.fields[i].position.column === fieldUnderAttack.position.column &&
                        map.fields[i].position.row === fieldUnderAttack.position.row) {
                        map.fields[i].durability--;
                        if (map.fields[i].durability < 1) {
                            map.fields.splice(i, 1);
                        }
                    }
                }

                map = Object.assign({}, map);
                break;
            case ActionType.LoopStart:
                // 
            case ActionType.LoopEnd:
            case ActionType.End:
                robot = Object.assign({}, robot);
                robot.currentAction = robotAction;
                break;
        }

        return {
            gameState: state.gameState,
            actions: state.actions,
            map,
            robot,
            goal: state.goal,
            events: [...state.events, { name: PERFORM_ACTION, body: action.payload }],
        };
    },
    [UPDATE_ROBOT]: (state: IState, action: Action<any>): IState => {
        console.log(`Executing robot movement ${JSON.stringify(action.payload)}`);
        if (!action.payload) { return state; }

        const robot = {...action.payload};

        return {
            gameState: state.gameState,
            actions: state.actions,
            map: state.map,
            robot,
            goal: state.goal,
            events: [...state.events, { name: UPDATE_ROBOT, body: action.payload }],
        };
    },
    [CHANGE_STATEMENT_ORDER]: (state: IState, action: Action<any>): IState => {
        let { newIndex, oldIndex } = action.payload;
        let actions = [...state.actions];
        const equal = (a: RobotAction, b: RobotAction) => a && b && a.direction === b.direction && a.type === b.type;
        if (oldIndex >= actions.length || oldIndex < 0) return state;
        if (newIndex >= actions.length || newIndex < 0) return state;

        console.log(`Moving item at index ${oldIndex} to ${newIndex}`);

        // find number of items to move
        let itemsToMove = 1;
        for (let i = oldIndex + 1; i < actions.length; i++) {
            if (!equal(actions[i], actions[oldIndex])) break;
            itemsToMove++;
        }

        // find "true" index to move
        const indexMap = [
            0
        ];
        for (let i = 1, index = 0; i<actions.length; i++) {
            console.log(`i: ${i}, index: ${index} - equal(actions[i], actions[i-1])=${equal(actions[i], actions[i-1])}`);
            if (equal(actions[i], actions[i-1])) {
                indexMap[index] = i;
            } else {
                index++;
                indexMap[index] = i;
            }
        }

        newIndex = newIndex == 0 ? 0 : indexMap[newIndex];

        console.log(`index map: ${JSON.stringify(indexMap)}; new index ${newIndex}`);

        const elements = actions.splice(oldIndex, itemsToMove);
        actions.splice(newIndex, 0, ...elements);

        return {
            gameState: state.gameState,
            actions: [...actions],
            map: state.map,
            robot: state.robot,
            goal: state.goal,
            events: [...state.events, { name: CHANGE_STATEMENT_ORDER, body: action.payload }],
        };
    },
    [CHANGE_STATEMENT_COUNT]: (state: IState, action: Action<any>): IState => {
        console.log(`Changing count to ${action.payload.count} on action with index ${action.payload.index}`);
        const change = action.payload;
        let actions = [...state.actions];
        if (actions.length < change.index) { return state; }
        const targetAction = actions[change.index];
        const equal = (a: RobotAction, b: RobotAction) => a.direction === b.direction && a.type === b.type;
        const remainder = actions.slice(change.index).some(_ => !equal(_, targetAction)) ?
            actions.slice(actions.slice(change.index).findIndex(_ => !equal(_, targetAction))) :
            [];

        actions = change.index === 0 ? [] : actions.slice(0, change.index);

        for (let i = 0; i < change.count; i++) {
            actions.push(Object.assign({}, targetAction));
        }

        actions.push(...remainder);
        return {
            gameState: state.gameState,
            actions,
            map: state.map,
            robot: state.robot,
            goal: state.goal,
            events: [...state.events, { name: CHANGE_STATEMENT_COUNT, body: action.payload }],
        };
    },
    [REMOVE_STATEMENT]: (state: IState, action: Action<any>): IState => {
        console.log(`Removing Statement ${JSON.stringify(action.payload)}`);
        const movements = state.actions.filter((_, index) => {
            return index !== action.payload;
        });

        return {
            gameState: state.gameState,
            actions: [...movements],
            map: state.map,
            robot: state.robot,
            goal: state.goal,
            events: [...state.events, { name: REMOVE_STATEMENT, body: action.payload }],
        };
    },
    [START]: (state: IState, action: Action<any>): IState => {
        return {
            gameState: GameState.RUNNING,
            actions: state.actions,
            map: state.map,
            robot: state.robot,
            goal: state.goal,
            events: [...state.events, { name: START, body: action.payload }],
        };
    },
    [STOP]: (state: IState, action: Action<any>): IState => {
        return {
            gameState: GameState.STOP,
            actions: state.actions,
            map: state.map,
            robot: state.robot,
            goal: state.goal,
            events: [...state.events, { name: STOP, body: action.payload }],
        };
    },
    [DIE]: (state: IState, action: Action<any>): IState => {
        console.log("A loose was triggered!");
        return {
            gameState: GameState.LOOSE,
            actions: state.actions,
            map: state.map,
            robot: state.robot,
            goal: state.goal,
            events: [...state.events, { name: DIE, body: action.payload }],
        };
    },
    [WIN]: (state: IState, action: Action<any>): IState => {
        console.log("A win was triggered!");
        return {
            gameState: GameState.WIN,
            actions: state.actions,
            map: state.map,
            robot: state.robot,
            goal: state.goal,
            events: [...state.events, { name: WIN, body: action.payload }],
        };
    },
}, initialState);