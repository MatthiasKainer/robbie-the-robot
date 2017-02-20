import { ParsingService, WordService } from '../../../../../../public/javascript/src/ast/parser';
import {
    AnyValueNode,
    AssignmentNode,
    CallFunctionNode,
    StringNode
} from '../../../../../../public/javascript/src/ast/availableNodes';
import { Direction, IState } from '../../../../../../public/javascript/src/models';
import RobotProcessor from '../../../../../../public/javascript/src/game/robot/processor';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
const expect = chai.expect;

let state: IState;

@suite("[RobotProcessor] When requesting a move for a robot")
class MovingRobot {

    before() {
        state = {
            map: {
                "key": "Tutorial",
                "name": "Tutorial",
                "maxStars": 2,
                "goals": [
                    { "stars": 2, "moves": 6, "runs": 1 },
                    { "stars": 1, "moves": 10, "runs": 2 }
                ],
                "template": "Tutorial",
                "size": {
                    "column": 3,
                    "row": 3
                },
                fields: [{ "sprite": "stone", "position": { "row": 0, "column": 0 } }]
            },
            robot: {
                position: {
                    row: 1,
                    column: 1
                }
            }
        };
    }

    @test("given the move to the right is valid, the robot should move")
    asserts_moveRight() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        let { position } = robotProcessor.robot;
        let row = position.row;
        let column = position.column;
        let functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.RIGHT].toLowerCase()}`)
        ).parse();

        let robot = robotProcessor.runNode(functionCall);
        expect(robot.position.row).be.eq(row);
        expect(robot.position.column).be.eq(column + 1);
    }

    @test("given the move to the left is valid, the robot should move")
    asserts_moveLeft() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        let { position } = robotProcessor.robot;
        let row = position.row;
        let column = position.column;
        let functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.LEFT].toLowerCase()}`)
        ).parse();

        let robot = robotProcessor.runNode(functionCall);
        expect(robot.position.row).be.eq(row);
        expect(robot.position.column).be.eq(column - 1);
    }

    @test("given the move up is valid, the robot should move")
    asserts_moveUp() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        let { position } = robotProcessor.robot;
        let row = position.row;
        let column = position.column;
        let functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.UP].toLowerCase()}`)
        ).parse();

        let robot = robotProcessor.runNode(functionCall);
        expect(robot.position.row).be.eq(row - 1);
        expect(robot.position.column).be.eq(column);
    }

    @test("given the move down is valid, the robot should move")
    asserts_moveDown() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        let { position } = robotProcessor.robot;
        let row = position.row;
        let column = position.column;
        let functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.DOWN].toLowerCase()}`)
        ).parse();

        let robot = robotProcessor.runNode(functionCall);
        expect(robot.position.row).be.eq(row + 1);
        expect(robot.position.column).be.eq(column);
    }

    @test("given the move down is valid loop, the robot should move")
    asserts_moveDownLoopTwice() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        let { position } = robotProcessor.robot;
        let row = position.row;
        let column = position.column;
        let functionCall = new ParsingService(
            WordService
                .create(`while(the count is 0 & our count < 2 & count is our count + 1) (
then move in the direction down
)`)
        ).parse();

        let robot = robotProcessor.runNode(functionCall);
        expect(robot.position.row).be.eq(row + 2);
        expect(robot.position.column).be.eq(column);
    }

    @test("given there is a collision, game should end")
    asserts_collision() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        let { position } = robotProcessor.robot;
        let row = position.row;
        let column = position.column;
        let functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.UP].toLowerCase()}`)
        ).parse();
        let robot = robotProcessor.runNode(functionCall);
        state.robot = robot;
        robotProcessor = new RobotProcessor(state.map, state.robot);
        functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.LEFT].toLowerCase()}`)
        ).parse();
        let exception = null;
        try {
            robotProcessor.runNode(functionCall);
        } catch (err) {
            exception = err;
        }
        expect(exception).not.to.be.null;
        expect(exception).to.contains("died because collision with");
    }

    @test("given the move down is too far, the game should end")
    asserts_moveDownOut() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        let { position } = robotProcessor.robot;
        let row = position.row;
        let column = position.column;
        let exception = null;
        let robot = null;
        for (let i = 0; i < state.map.size.row + 1; i++) {
            try {
                let functionCall = new ParsingService(
                    WordService
                        .create(`then move in the direction ${Direction[Direction.DOWN].toLowerCase()}`)
                ).parse();
                robot = robotProcessor.runNode(functionCall);
                state.robot = robot;
                robotProcessor = new RobotProcessor(state.map, state.robot);
            } catch (err) {
                exception = err;
                break;
            }
        }
        expect(exception).not.to.be.null;
        expect(exception).to.contains("died because outside the map:");
        // should be on the last valid place
        expect(robot.position.row).be.eq(state.map.size.row);
        expect(robot.position.column).be.eq(column);
    }

    @test("given the move up is too far, the game should end")
    asserts_moveUpOut() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        let { position } = robotProcessor.robot;
        let row = position.row;
        let column = position.column;
        let exception = null;
        let robot = null;
        for (let i = 0; i < row + 2; i++) {
            try {
                let functionCall = new ParsingService(
                    WordService
                        .create(`then move in the direction ${Direction[Direction.UP].toLowerCase()}`)
                ).parse();
                robot = robotProcessor.runNode(functionCall);
                state.robot = robot;
                robotProcessor = new RobotProcessor(state.map, state.robot);
            } catch (err) {
                exception = err;
                break;
            }
        }
        // should be on the last valid place
        expect(robot.position.row).be.eq(0);
        expect(robot.position.column).be.eq(column);

        expect(exception).not.to.be.null;
        expect(exception).to.contains("died because outside the map:");
    }

    @test("given the move left is too far, the game should end")
    asserts_moveLeftOut() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        let { position } = robotProcessor.robot;
        let row = position.row;
        let column = position.column;
        let exception = null;
        let robot = null;
        for (let i = 0; i < column + 1; i++) {
            try {

                let functionCall = new ParsingService(
                    WordService
                        .create(`then move in the direction ${Direction[Direction.LEFT].toLowerCase()}`)
                ).parse();
                robot = robotProcessor.runNode(functionCall);
                state.robot = robot;
                robotProcessor = new RobotProcessor(state.map, state.robot);
            } catch (err) {
                exception = err;
                break;
            }
        }

        expect(exception).not.to.be.null;
        expect(exception).to.contains("died because outside the map:");

        expect(robot).not.to.be.null;
        // should be on the last valid place
        expect(robot.position.row).be.eq(row);
        expect(robot.position.column).be.eq(0);
    }

    @test("given the move right is too far, the game should end")
    asserts_moveRightOut() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        let { position } = robotProcessor.robot;
        let row = position.row;
        let column = position.column;
        let exception = null;
        let robot = null;
        for (let i = 0; i < state.map.size.column + 1; i++) {
            try {
                let functionCall = new ParsingService(
                    WordService
                        .create(`then move in the direction ${Direction[Direction.RIGHT].toLowerCase()}`)
                ).parse();
                robot = robotProcessor.runNode(functionCall);
                state.robot = robot;
                robotProcessor = new RobotProcessor(state.map, state.robot);
            } catch (err) {
                exception = err;
                break;
            }
        }
        
        // should be on the last valid place
        expect(robot.position.row).be.eq(row);
        expect(robot.position.column).be.eq(state.map.size.column);

        expect(exception).not.to.be.null;
        expect(exception).to.contains("died because outside the map:");
    }
}