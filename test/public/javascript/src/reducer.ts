import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import { IState, Action, ActionType, Robot, GameState } from "../../../../public/javascript/src/models";
import handleActions from "../../../../public/javascript/src/reducers";
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
} from "../../../../public/javascript/src/actions";
import { Action as ReduxAction } from "redux-actions";
import * as deepfreeze from "deep-freeze";
const expect = chai.expect;

const templateState : IState = {
    map: {
        "key": "init",
        "name": "init",
        "maxStars": 0,
        "goals": null,
        "template": "init",
        "size": null,
        fields: null,
    },
    actions: [],
    robot: {
        position: {
            row: 1,
            column: 1,
        },
    },
    events: [],
};

@suite("[reducer] When setting the map")
class SettingMap {
    state : IState;
    
    public before() {
        this.state = { ...templateState };
        deepfreeze(this.state);
    }

    @test public "given i add a null map, the map should be an empty object and an event should be added"() {
        const action : ReduxAction<any> = {
            type: SET_MAP,
            payload: null
        };

        const result = handleActions(this.state, action);
        // the map should never be null
        expect(result.map).to.be.deep.eq({});
        expect(result.robot).to.be.eq(templateState.robot);
        expect(result.events.length).to.be.eq(1);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }

    @test public "given i add a valid map, the map should be changed and an event should be added"() {
        const newMap = {
            "key": "Tutorial",
            "name": "Tutorial",
            "maxStars": 2,
            "goals": [
                { "stars": 2, "moves": 6, "runs": 1 },
                { "stars": 1, "moves": 10, "runs": 2 },
            ],
            "template": "Tutorial",
            "size": {
                "column": 3,
                "row": 3,
            },
            fields: [{ "sprite": "stone", "position": { "row": 0, "column": 0 } }],
        };
        const action : ReduxAction<any> = {
            type: SET_MAP,
            payload: newMap
        };

        const result = handleActions(this.state, action);
        expect(result.map).to.be.deep.eq(newMap);
        expect(result.robot).to.be.eq(templateState.robot);
        expect(result.events.length).to.be.eq(1);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }
}

@suite("[reducer] When storing a new action")
class StoreAction {
    state : IState;
    
    public before() {
        this.state = { ...templateState };
        deepfreeze(this.state);
    }

    @test public "given i add a null action it should not touch the state"() {
        const action : ReduxAction<any> = {
            type: STORE_ACTION,
            payload: null
        };

        const result = handleActions(this.state, action);
        // the map should never be null
        expect(result).to.be.eq(this.state);
    }

    @test public "given i add a valid action"() {
        const newAction : Action = {
            type: ActionType.Dig,
            direction: null,
            nesting: 0
        };
        const action : ReduxAction<any> = {
            type: STORE_ACTION,
            payload: newAction
        };

        const result = handleActions(this.state, action);
        expect(result.actions.length).to.eq(1);
        expect(result.actions[0]).to.be.deep.eq(newAction);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }
}

@suite("[reducer] When updating the robot")
class UpdateRobot {
    state : IState;
    
    public before() {
        this.state = { ...templateState };
        deepfreeze(this.state);
    }

    @test public "given i add a null robot it should not touch the state"() {
        const action : ReduxAction<any> = {
            type: UPDATE_ROBOT,
            payload: null
        };

        const result = handleActions(this.state, action);
        expect(result).to.be.eq(this.state);
    }

    @test public "given i perform a valid move on the robot"() {
        const newRobot : Robot = {
            position : null
        };
        const action : ReduxAction<any> = {
            type: UPDATE_ROBOT,
            payload: newRobot
        };

        const result = handleActions(this.state, action);
        expect(result.robot).to.be.deep.eq(newRobot);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }
}

@suite("[reducer] When removing a statement")
class RemoveStatement {
    state : IState;
    existingStatement : Action;
    
    public before() {
        this.existingStatement = {
            type: ActionType.Dig,
            direction : null,
            nesting : 0
        };
        this.state = { ...templateState, actions : [this.existingStatement] };
        deepfreeze(this.state);
    }

    @test public "given i remove a statement that does not exist nothing should happen and the attempt should be logged"() {
        const action : ReduxAction<any> = {
            type: REMOVE_STATEMENT,
            payload: 15
        };

        const result = handleActions(this.state, action);
        expect(result.actions.length).to.eq(1);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }

    @test public "given i remove a statement that does exist"() {
        const action : ReduxAction<any> = {
            type: REMOVE_STATEMENT,
            payload: 0
        };

        const result = handleActions(this.state, action);
        expect(result.actions.length).to.eq(0);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }
}

@suite("[reducer] Game states changes")
class GameStateChanges {
    state : IState;
    
    public before() {
        this.state = { ...templateState };
        deepfreeze(this.state);
    }

    @test public "given the game starts"() {
        const action : ReduxAction<any> = {
            type: START
        };

        const result = handleActions(this.state, action);
        expect(result.gameState).to.eq(GameState.RUNNING);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }

    @test public "given the game stops"() {
        const action : ReduxAction<any> = {
            type: STOP
        };

        const result = handleActions(this.state, action);
        expect(result.gameState).to.eq(GameState.STOP);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }

    @test public "given the player dies"() {
        const action : ReduxAction<any> = {
            type: DIE
        };

        const result = handleActions(this.state, action);
        expect(result.gameState).to.eq(GameState.LOOSE);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }

    @test public "given the player wins"() {
        const action : ReduxAction<any> = {
            type: WIN
        };

        const result = handleActions(this.state, action);
        expect(result.gameState).to.eq(GameState.WIN);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }
}


@suite("[reducer] When changing the count for one statement")
class ChangeCountOfStatement {
    state : IState;
    existingStatement : Action;
    
    public before() {
        this.existingStatement = {
            type: ActionType.Dig,
            direction : null,
            nesting : 0
        };
        this.state = { ...templateState, actions : [this.existingStatement, this.existingStatement] };
        deepfreeze(this.state);
    }

    @test public "given i remove a statement that does not exist nothing should happen"() {
        const action : ReduxAction<any> = {
            type: CHANGE_STATEMENT_COUNT,
            payload: {
                index : 5,
                count : 0
            }
        };

        const result = handleActions(this.state, action);
        expect(result).to.eq(this.state);
    }

    @test public "given i increase the count for an statement"() {
        const action : ReduxAction<any> = {
            type: CHANGE_STATEMENT_COUNT,
            payload: {
                index : 0,
                count : 3
            }
        };

        const result = handleActions(this.state, action);
        expect(result.actions.length).to.eq(action.payload.count);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }

    @test public "given i decrease the count for an statement"() {
        const action : ReduxAction<any> = {
            type: CHANGE_STATEMENT_COUNT,
            payload: {
                index : 0,
                count : 1
            }
        };

        const result = handleActions(this.state, action);
        expect(result.actions.length).to.eq(action.payload.count);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }
}

@suite("[reducer] When changing the order for one statement")
class ChangeOrderOfStatement {
    state : IState;
    existingStatement : Action;
    anotherExistingStatement : Action;
    
    public before() {
        this.existingStatement = {
            type: ActionType.Dig,
            direction : null,
            nesting : 0
        };
        this.anotherExistingStatement = {
            type: ActionType.Movement,
            direction : null,
            nesting : 0
        };
        this.state = { ...templateState, actions : [this.existingStatement, this.anotherExistingStatement, this.existingStatement] };
        deepfreeze(this.state);
    }

    @test public "given i move a statement that does not exist nothing should happen"() {
        const action : ReduxAction<any> = {
            type: CHANGE_STATEMENT_ORDER,
            payload: {
                newIndex : 0,
                oldIndex : 15
            }
        };

        const result = handleActions(this.state, action);
        expect(result).to.eq(this.state);
    }

    @test public "given i move a statement to an index that does not exist nothing should happen"() {
        const action : ReduxAction<any> = {
            type: CHANGE_STATEMENT_ORDER,
            payload: {
                newIndex : 15,
                oldIndex : 0
            }
        };

        const result = handleActions(this.state, action);
        expect(result).to.eq(this.state);
    }

    @test public "given i move an item that is alone to the first index"() {
        const action : ReduxAction<any> = {
            type: CHANGE_STATEMENT_ORDER,
            payload: {
                newIndex : 0,
                oldIndex : 1
            }
        };

        const result = handleActions(this.state, action);
        expect(result.actions.length).to.eq(this.state.actions.length);
        expect(result.actions[0]).to.be.deep.eq(this.anotherExistingStatement);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }

    @test public "given i move items in a group it should move all items in group"() {
        // for the ui, the groups are implicit - they will be clubbed together
        const action : ReduxAction<any> = {
            type: CHANGE_STATEMENT_ORDER,
            payload: {
                newIndex : 1,
                oldIndex : 0
            }
        };

        const result = handleActions({ 
            ...templateState, 
            actions : [this.existingStatement, this.existingStatement, this.anotherExistingStatement, this.existingStatement] 
        }, action);
        expect(result.actions.length).to.eq(4);
        expect(result.actions[0]).to.be.deep.eq(this.anotherExistingStatement, `First item should be of type ${this.anotherExistingStatement.type} (of group)`);
        expect(result.actions[1]).to.be.deep.eq(this.existingStatement, `Second item should be of type ${this.existingStatement.type} (of group)`);
        expect(result.actions[2]).to.be.deep.eq(this.existingStatement, `Second item should be of type ${this.existingStatement.type} (of group)`);
        expect(result.actions[3]).to.be.deep.eq(this.existingStatement, `Third item should be of type ${this.existingStatement.type} (of group)`);
        
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }

    @test public "given i want to move one item to the bottom which is currently a group with a shared index, it should not split the group"() {
        
        // for the ui, the groups are implicit - they will be clubbed together
        const action : ReduxAction<any> = {
            type: CHANGE_STATEMENT_ORDER,
            payload: {
                newIndex : 1,
                oldIndex : 0
            }
        };

        const result = handleActions({ 
            ...templateState, 
            actions : [this.anotherExistingStatement, this.existingStatement, this.existingStatement] 
        }, action);
        expect(result.actions.length).to.eq(3);
        expect(result.actions[0]).to.be.deep.eq(this.existingStatement, `First item should be of type ${this.existingStatement.type} (of group)`);
        expect(result.actions[1]).to.be.deep.eq(this.existingStatement, `Second item should be of type ${this.existingStatement.type} (of group)`);
        expect(result.actions[2]).to.be.deep.eq(this.anotherExistingStatement, `Last item should be of type ${this.existingStatement.type} (single)`);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }

    @test public "given i want to move one item to the top which is currently a group with a shared index, it should not split the group"() {
        
        // for the ui, the groups are implicit - they will be clubbed together
        const action : ReduxAction<any> = {
            type: CHANGE_STATEMENT_ORDER,
            payload: {
                newIndex : 0,
                oldIndex : 2
            }
        };

        const result = handleActions({ 
            ...templateState, 
            actions : [this.existingStatement, this.existingStatement, this.anotherExistingStatement] 
        }, action);
        expect(result.actions.length).to.eq(3);
        expect(result.actions[0]).to.be.deep.eq(this.anotherExistingStatement, `First item should be of type ${this.existingStatement.type} (single)`);
        expect(result.actions[1]).to.be.deep.eq(this.existingStatement, `Second item should be of type ${this.existingStatement.type} (of group)`);
        expect(result.actions[2]).to.be.deep.eq(this.existingStatement, `Third item should be of type ${this.existingStatement.type} (of group)`);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }

    @test public "given i want to move an order group to the bottom which is currently a group with a shared index"() {
        
        // for the ui, the groups are implicit - they will be clubbed together
        const action : ReduxAction<any> = {
            type: CHANGE_STATEMENT_ORDER,
            payload: {
                newIndex : 1,
                oldIndex : 0
            }
        };

        const result = handleActions({ 
            ...templateState, 
            actions : [this.existingStatement, this.existingStatement, this.anotherExistingStatement] 
        }, action);
        expect(result.actions.length).to.eq(3);
        expect(result.actions[0]).to.be.deep.eq(this.anotherExistingStatement, `First item should be of type ${this.anotherExistingStatement.type} (single)`);
        expect(result.actions[1]).to.be.deep.eq(this.existingStatement, `Second item should be of type ${this.existingStatement.type} (of group)`);
        expect(result.actions[2]).to.be.deep.eq(this.existingStatement, `Third item should be of type ${this.existingStatement.type} (of group)`);
        expect(result.events[0]).to.be.deep.eq({
            name: action.type,
            body : action.payload
        });
    }
}