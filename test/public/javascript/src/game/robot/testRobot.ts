import { ParsingService, WordService } from "../../../../../../public/javascript/src/ast/parser";
import {
    AnyValueNode,
    AssignmentNode,
    CallFunctionNode,
    StringNode,
} from "../../../../../../public/javascript/src/ast/availableNodes";
import { Direction, IState } from "../../../../../../public/javascript/src/models";
import RobotProcessor from "../../../../../../public/javascript/src/game/robot/processor";
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
const expect = chai.expect;

let state: IState;

@suite("[RobotProcessor] When requesting a move for a robot")
class MovingRobot {

    public before() {
        state = {
            map: {
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
            },
            robot: {
                position: {
                    row: 1,
                    column: 1,
                },
            },
        };
    }

    @test public "given the move to the right is valid, the robot should move"() {
        const robotProcessor = new RobotProcessor(state.map, state.robot);
        const { position } = robotProcessor.robot;
        const row = position.row;
        const column = position.column;
        const functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.RIGHT].toLowerCase()}`),
        ).parse();

        const robot = robotProcessor.runNode(functionCall);
        expect(robot.position.row).be.eq(row);
        expect(robot.position.column).be.eq(column + 1);
    }

    @test public "given the move to the left is valid, the robot should move"() {
        const robotProcessor = new RobotProcessor(state.map, state.robot);
        const { position } = robotProcessor.robot;
        const row = position.row;
        const column = position.column;
        const functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.LEFT].toLowerCase()}`),
        ).parse();

        const robot = robotProcessor.runNode(functionCall);
        expect(robot.position.row).be.eq(row);
        expect(robot.position.column).be.eq(column - 1);
    }

    @test public "given the move up is valid, the robot should move"() {
        const robotProcessor = new RobotProcessor(state.map, state.robot);
        const { position } = robotProcessor.robot;
        const row = position.row;
        const column = position.column;
        const functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.UP].toLowerCase()}`),
        ).parse();

        const robot = robotProcessor.runNode(functionCall);
        expect(robot.position.row).be.eq(row - 1);
        expect(robot.position.column).be.eq(column);
    }

    @test public "given the move down is valid, the robot should move"() {
        const robotProcessor = new RobotProcessor(state.map, state.robot);
        const { position } = robotProcessor.robot;
        const row = position.row;
        const column = position.column;
        const functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.DOWN].toLowerCase()}`),
        ).parse();

        const robot = robotProcessor.runNode(functionCall);
        expect(robot.position.row).be.eq(row + 1);
        expect(robot.position.column).be.eq(column);
    }

    @test public "given the move down is valid loop, the robot should move"() {
        const robotProcessor = new RobotProcessor(state.map, state.robot);
        const { position } = robotProcessor.robot;
        const row = position.row;
        const column = position.column;
        const functionCall = new ParsingService(
            WordService
                .create(`while(the count is 0 & our count < 2 & count is our count + 1) (
then move in the direction down
)`),
        ).parse();

        const robot = robotProcessor.runNode(functionCall);
        expect(robot.position.row).be.eq(row + 2);
        expect(robot.position.column).be.eq(column);
    }

    @test public "given there is a collision, game should end"() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        const { position } = robotProcessor.robot;
        const row = position.row;
        const column = position.column;
        let functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.UP].toLowerCase()}`),
        ).parse();
        const robot = robotProcessor.runNode(functionCall);
        state.robot = robot;
        robotProcessor = new RobotProcessor(state.map, state.robot);
        functionCall = new ParsingService(
            WordService
                .create(`then move in the direction ${Direction[Direction.LEFT].toLowerCase()}`),
        ).parse();
        let exception = null;
        try {
            robotProcessor.runNode(functionCall);
        } catch (err) {
            exception = err;
        }
        expect(exception).not.to.be.null;
        expect(exception.message).to.contains("died because collision with");
    }

    @test public "given the move down is too far, the game should end"() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        const { position } = robotProcessor.robot;
        const row = position.row;
        const column = position.column;
        let exception = null;
        let robot = null;
        for (let i = 0; i < state.map.size.row + 1; i++) {
            try {
                const functionCall = new ParsingService(
                    WordService
                        .create(`then move in the direction ${Direction[Direction.DOWN].toLowerCase()}`),
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
        expect(exception.message).to.contains("died because outside the map:");
        // should be on the last valid place
        expect(robot.position.row).be.eq(state.map.size.row);
        expect(robot.position.column).be.eq(column);
    }

    @test public "given the move up is too far, the game should end"() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        const { position } = robotProcessor.robot;
        const row = position.row;
        const column = position.column;
        let exception = null;
        let robot = null;
        for (let i = 0; i < row + 2; i++) {
            try {
                const functionCall = new ParsingService(
                    WordService
                        .create(`then move in the direction ${Direction[Direction.UP].toLowerCase()}`),
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
        expect(exception.message).to.contains("died because outside the map:");
    }

    @test public "given the move left is too far, the game should end"() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        const { position } = robotProcessor.robot;
        const row = position.row;
        const column = position.column;
        let exception = null;
        let robot = null;
        for (let i = 0; i < column + 1; i++) {
            try {

                const functionCall = new ParsingService(
                    WordService
                        .create(`then move in the direction ${Direction[Direction.LEFT].toLowerCase()}`),
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
        expect(exception.message).to.contains("died because outside the map:");

        expect(robot).not.to.be.null;
        // should be on the last valid place
        expect(robot.position.row).be.eq(row);
        expect(robot.position.column).be.eq(0);
    }

    @test public "given the move right is too far, the game should end"() {
        let robotProcessor = new RobotProcessor(state.map, state.robot);
        const { position } = robotProcessor.robot;
        const row = position.row;
        const column = position.column;
        let exception = null;
        let robot = null;
        for (let i = 0; i < state.map.size.column + 1; i++) {
            try {
                const functionCall = new ParsingService(
                    WordService
                        .create(`then move in the direction ${Direction[Direction.RIGHT].toLowerCase()}`),
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
        expect(exception.message).to.contains("died because outside the map:");
    }
}