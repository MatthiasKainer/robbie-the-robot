import { Operator } from "../../../../../public/javascript/src/ast/node";
import * as stringDecoder from "string_decoder";
import { stringify } from "querystring";
import { Parser, ParsingService, WordService } from "../../../../../public/javascript/src/ast/parser";
import {
    AssignmentNode,
    CallFunctionNode,
    ClassNode,
    ExpandVariableNode,
    ExportNode,
    ExportSequenceNode,
    NumberNode,
    OperationNode,
    StringNode,
    UnwrapSequenceNode,
    VariableNode
} from "../../../../../public/javascript/src/ast/availableNodes";
import { VariableParser } from "../../../../../public/javascript/src/ast/availableParsers";
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
const expect = chai.expect;

let trigger = "let";

@suite("[VariableParser] When asking if the parser can parse word")
class ShouldParseVariable {
    parser = new VariableParser(new ParsingService([]));

    @test "given the word should start the parser"() {
        expect(this.parser.activate(trigger)).to.be.true;
    }

    @test "given the word should not start the parser"() {
        expect(this.parser.activate("anythingnotatrigger")).to.be.false;
        expect(this.parser.activate("")).to.be.false;
    }
}

@suite("[VariableParser] When transforming to ast")
class TransformToAst {
    /**
    *  let robot = make Robot (
    *      let position = make Position (
    *          row = 1
    *          column = 2
    *      )
    *  )
    *  let lorentz
    *   
    */
    parser: ParsingService;

    @test "given name is missing"() {
        let statement = "let";
        let error = null;
        try {
            this.parser = new ParsingService(WordService.create(statement));
            let result = this.parser.parse();
            expect(result).to.be.null;
        } catch (err) {
            error = err;
        }

        expect(error).not.null;
        expect(error.message).contains("Incomplete code");
    }

    @test "given variable is created"() {
        let statement = "the robot";
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        expect(result).to.be.deep.eq(new VariableNode(new StringNode("robot")));
    }

    @test "given double variable is created"() {
        // its a language for kids, this is most propably a copy and paste error - be tolerant
        let statement = "the the robot";
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        expect(result).to.be.deep.eq(new VariableNode(new StringNode("robot")));
    }

    @test "given assigned to nothing"() {
        let statement = `is 5`;
        let error = null;
        try {
            this.parser = new ParsingService(WordService.create(statement));
            let result = this.parser.parse();
        } catch (err) {
            error = err;
        }
        expect(error).not.null;
        expect(error.message).to.contains("Variable assignment cannot be the first statement");
    }

    @test "given variable is created and assigned with a primitive"() {
        let statement = `the robot is 5`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        expect(result).to.be.deep.eq(new ExportSequenceNode(
            new VariableNode(new StringNode("robot")),
            new AssignmentNode(new StringNode("robot"), new NumberNode(5))));
    }

    @test "given variable is created and assigned with a multiline and escaped string"() {
        let statement = `the robot is "a string 
        spanning multiple lines and an\\" escaped \\" "`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        expect(result).to.be.deep.eq(new ExportSequenceNode(
            new VariableNode(new StringNode("robot")),
            new AssignmentNode(new StringNode("robot"), new StringNode(`a string 
        spanning multiple lines and an\\" escaped \\" `))));
    }

    @test "given variable is created and assigned with a string"() {
        let statement = `the robot is "the"`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        expect(result).to.be.deep.eq(new ExportSequenceNode(
            new VariableNode(new StringNode("robot")),
            new AssignmentNode(new StringNode("robot"), new StringNode(`the`))));
    }

    @test "given variable is created, assigned with a primitive and exported"() {
        let statement = `let robot is 5
        export robot`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        expect(result).to.be.deep.eq(new ExportSequenceNode(
            new VariableNode(new StringNode("robot")),
            new AssignmentNode(new StringNode("robot"), new NumberNode(5)),
            new ExportNode(new StringNode("robot"))));
    }

    @test "given variable is created and assigned with a class"() {
        let statement = `the robot is a Robot ()`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        let robotData = new ClassNode("Robot", {});
        expect(result).to.be.deep.eq(new ExportSequenceNode(
            new VariableNode(new StringNode("robot")),
            new AssignmentNode(new StringNode("robot"), robotData)));
    }

    @test "given variable is deep"() {
        let statement = `export our robot.position.row`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        expect(result).to.be.deep.eq(new ExportNode(new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("row")))));
    }

    @test "given assigning simple variable with a deep variable"() {
        let statement = `robot is our robot.position.row`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        let assignment = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("row")));
        expect(result).to.be.deep.eq(new AssignmentNode(new StringNode("robot"), assignment));
    }

    @test "given assigning deep variable with a simple variable"() {
        let statement = `robot.position.column is our row`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        let assignment = new ExpandVariableNode(new StringNode("row"));
        expect(result).to.be.deep.eq(new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new AssignmentNode(new StringNode("column"), assignment)));
    }

    @test "given assigning deep variable with a string"() {
        let statement = `robot.position.column is row`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        let assignment = new StringNode("row");
        expect(result).to.be.deep.eq(new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new AssignmentNode(new StringNode("column"), assignment)));
    }

    @test "given assigning deep variable with a deep variable"() {
        let statement = `robot.position.column is our robot.position.row`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        let assignment = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("row")));
        expect(result).to.be.deep.eq(new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new AssignmentNode(new StringNode("column"), assignment)));
    }

    @test "given assigning deep variable with a deep variable that is incremented"() {
        let statement = `robot.position.column is our robot.position.row + 1`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        let assignment = new OperationNode(Operator.Add, new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("row"))), new NumberNode(1));
        expect(result).to.be.deep.eq(new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new AssignmentNode(new StringNode("column"), assignment)));
    }

    @test "given assigning deep variable with a variable that is incremented"() {
        let statement = `robot is our robot + 1`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        let assignment = new OperationNode(Operator.Add, 
        new ExpandVariableNode(new StringNode("robot")), new NumberNode(1));
        expect(result).to.be.deep.eq(
            new AssignmentNode(new StringNode("robot"), assignment));
    }

    @test "given variable is created and assigned with a complex class"() {
        let statement = `the robot is a Robot (
            the position is 2
        )`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        let robotData = new ClassNode("Robot", {
            "position": new NumberNode(2)
        });
        expect(result).to.be.deep.eq(new ExportSequenceNode(
            new VariableNode(new StringNode("robot")),
            new AssignmentNode(new StringNode("robot"), robotData)));
    }

    @test "given variable is created and assigned with a complex nested class"() {
        let statement = `the robot is a Robot (
            the position is a Position (
                the row is 1
                the column is 2
            )
        )`;
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();

        let positionData = new ClassNode("Position", {
            "row" : new NumberNode(1),
            "column" : new NumberNode(2)
        })
        let robotData = new ClassNode("Robot", {
            "position": positionData
        });
        expect(result).to.be.deep.eq(new ExportSequenceNode(
            new VariableNode(new StringNode("robot")),
            new AssignmentNode(new StringNode("robot"), robotData)));
    }

    public createFromFunction() {
        let statement = "let call name";
        this.parser = new ParsingService(WordService.create(statement));
        let result = this.parser.parse();
        expect(result).to.be.deep.eq(new VariableNode(new CallFunctionNode(new StringNode("name"))));
    }

    public createWithType() {
        let statement = "let robot as Robot";
        new VariableNode(new StringNode("robot"), new StringNode("Robot"));
    }

}