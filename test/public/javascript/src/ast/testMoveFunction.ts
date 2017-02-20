import { ParsingService, WordService } from '../../../../../public/javascript/src/ast/parser';
import { WordParser } from '../../../../../public/javascript/src/ast/availableParsers';
import { Operator } from '../../../../../public/javascript/src/ast/node';
import {
    AnyValueNode,
    AssignmentNode,
    CallFunctionNode,
    ClassNode,
    ExpandVariableNode,
    ExportNode,
    ExportSequenceNode,
    FunctionNode,
    NumberNode,
    OperationNode,
    SequenceNode,
    StringNode,
    SwitchComparisonNode,
    SwitchNode,
    UnwrapSequenceNode,
    VariableNode
} from '../../../../../public/javascript/src/ast/availableNodes';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
const expect = chai.expect;

@suite("[Move Integration Test EN] When creating the move function in english")
class MoveEnglish {
    sentence = `
the robot is a Robot (
    the position is a Position (
        the row is 1
        the column is 2
    )
)

when move in the direction (
    switch our direction (
        up (
            robot.position.row is our robot.position.row - 1
        )
        down (
            robot.position.row is our robot.position.row + 1
        )
        left (
            robot.position.column is our robot.position.column - 1
        )
        right (
            robot.position.column is our robot.position.column + 1
        )
    )
    
    export robot
)

then move in the direction up`; 

    expected = () => {
        let positionData = new ClassNode("Position", {
            "row": new NumberNode(1),
            "column": new NumberNode(2)
        });

        let robotData = new ClassNode("Robot", {
            "position": positionData
        });

        let robotVariable = new VariableNode(new StringNode("robot"));
        let assignedRobot = new AssignmentNode(new StringNode("robot"), robotData);

        let row = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("row")));
        let column = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("column")));

        let positionScope = (variable: string, operation: OperationNode) =>
            new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
                        new ExpandVariableNode(new StringNode("position")),
                        new AssignmentNode(new StringNode(variable), operation));

        let moveBody = new ExportSequenceNode(
            new SwitchNode(new ExpandVariableNode(new StringNode("direction")),
                new SwitchComparisonNode(new StringNode("up"),
                    positionScope("row", new OperationNode(Operator.Substract, row, new NumberNode(1)))),
                new SwitchComparisonNode(new StringNode("down"),
                    positionScope("row", new OperationNode(Operator.Add, row, new NumberNode(1)))),
                new SwitchComparisonNode(new StringNode("left"),
                    positionScope("column", new OperationNode(Operator.Substract, column, new NumberNode(1)))),
                new SwitchComparisonNode(new StringNode("right"),
                    positionScope("column", new OperationNode(Operator.Add, column, new NumberNode(1))))
            ), new ExportNode(new StringNode("robot")));

        // create function for movement
        let move = new FunctionNode("move", moveBody, null,
            new VariableNode(new StringNode("direction")));

        return new ExportSequenceNode(robotVariable, assignedRobot, move, new CallFunctionNode(new StringNode("move"), 
            new AssignmentNode(new StringNode("direction"), new StringNode("up"))));
    }

    @test("given the word should start the parser")
    public start() {
        let parser = new ParsingService(WordService.create(this.sentence), "en");
        let result = parser.parse();
        if (console.debug) console.log(JSON.stringify(result, undefined, 2));
        expect(result).to.be.deep.eq(this.expected());
    }
}

@suite("[Move Integration Test DE] When creating the move function in german")
class MoveGerman {
    sentence = `
der Roboter ist ein Roboter (
    die Position ist eine Position (
        die Reihe ist 1
        die Spalte ist 2
    )
)

wenn bewegen in die Richtung (
    falls unsere Richtung (
        hoch (
            Roboter.Position.Reihe ist unsere Roboter.Position.Reihe - 1
        )
        runter (
            Roboter.Position.Reihe ist unsere Roboter.Position.Reihe + 1
        )
        links (
            Roboter.Position.Spalte ist unsere Roboter.Position.Spalte - 1
        )
        rechts (
            Roboter.Position.Spalte ist unsere Roboter.Position.Spalte + 1
        )
    )
    
    export Roboter
)

then move in the direction up`; 

    expected = () => {
        let positionData = new ClassNode("Position", {
            "row": new NumberNode(1),
            "column": new NumberNode(2)
        });

        let robotData = new ClassNode("Robot", {
            "position": positionData
        });

        let robotVariable = new VariableNode(new StringNode("robot"));
        let assignedRobot = new AssignmentNode(new StringNode("robot"), robotData);

        let row = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("row")));
        let column = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("column")));

        let positionScope = (variable: string, operation: OperationNode) =>
            new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
                        new ExpandVariableNode(new StringNode("position")),
                        new AssignmentNode(new StringNode(variable), operation));

        let moveBody = new ExportSequenceNode(
            new SwitchNode(new ExpandVariableNode(new StringNode("direction")),
                new SwitchComparisonNode(new StringNode("up"),
                    positionScope("row", new OperationNode(Operator.Substract, row, new NumberNode(1)))),
                new SwitchComparisonNode(new StringNode("down"),
                    positionScope("row", new OperationNode(Operator.Add, row, new NumberNode(1)))),
                new SwitchComparisonNode(new StringNode("left"),
                    positionScope("column", new OperationNode(Operator.Substract, column, new NumberNode(1)))),
                new SwitchComparisonNode(new StringNode("right"),
                    positionScope("column", new OperationNode(Operator.Add, column, new NumberNode(1))))
            ), new ExportNode(new StringNode("robot")));

        // create function for movement
        let move = new FunctionNode("move", moveBody, null,
            new VariableNode(new StringNode("direction")));

        return new ExportSequenceNode(robotVariable, assignedRobot, move, new CallFunctionNode(new StringNode("move"), 
            new AssignmentNode(new StringNode("direction"), new StringNode("up"))));
    }

    public start() {
        let parser = new ParsingService(WordService.create(this.sentence), "en");
        let result = parser.parse();
        if (console.debug) console.log(JSON.stringify(result, undefined, 2));
        expect(result).to.be.deep.eq(this.expected());
    }
}