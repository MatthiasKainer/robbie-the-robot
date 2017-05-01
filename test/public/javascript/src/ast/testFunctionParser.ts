import {
    AssignmentNode,
    CallFunctionNode,
    ExpandVariableNode,
    ExportNode,
    ExportSequenceNode,
    FunctionNode,
    StringNode,
    VariableNode,
} from "../../../../../public/javascript/src/ast/availableNodes";
import { DeclareFunctionParser } from "../../../../../public/javascript/src/ast/availableParsers";
import { ParsingService, WordService } from "../../../../../public/javascript/src/ast/parser";

import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
const expect = chai.expect;

const trigger = "when";

@suite("[DeclareFunctionParser] When asking if the parser can parse word")
class ShouldParseFunction {
    private parser = new DeclareFunctionParser(new ParsingService([]));

    @test public "given the word should start the parser"() {
        expect(this.parser.activate(trigger)).to.be.true;
    }

    @test public "given the word should not start the parser"() {
        expect(this.parser.activate("anythingnotatrigger")).to.be.false;
        expect(this.parser.activate("")).to.be.false;
    }
}

@suite("[DeclareFunctionParser] When trying to parse a function")
class TestFunctionParser {

    @test public "given function is created"() {
        const statement = `when move in the direction (
    export "when"
)`;
        const parser = new ParsingService(WordService.create(statement));
        const result = parser.parse();
        expect(result).to.be.deep.eq(new FunctionNode("move",
            new ExportNode(new StringNode("when")),
            null,
            new VariableNode(new StringNode("direction"))),
        );
    }

    @test public "given function is created and called"() {
        const statement = `when move in the direction ( export "when" ) then move `;
        const parser = new ParsingService(WordService.create(statement));
        const result = parser.parse();
        expect(result).to.be.deep.eq(new ExportSequenceNode(new FunctionNode("move",
            new ExportNode(new StringNode("when")),
            null,
            new VariableNode(new StringNode("direction"))),
            new CallFunctionNode(new StringNode("move"))),
        );
    }

    @test public "given complex function is created and called"() {
        const statement = `when move in the direction ( the result export our result ) then move `;
        const parser = new ParsingService(WordService.create(statement));
        const result = parser.parse();
        expect(result).to.be.deep.eq(new ExportSequenceNode(new FunctionNode("move",
            new ExportSequenceNode(new VariableNode(new StringNode("result")), new ExportNode(new ExpandVariableNode(new StringNode("result")))),
            null,
            new VariableNode(new StringNode("direction"))),
            new CallFunctionNode(new StringNode("move"))),
        );
    }

    @test public "given function is created and called with arguments"() {
        const statement = `when move in the direction (
    export "when"
)
then move in the direction UP`;
        const parser = new ParsingService(WordService.create(statement));
        const result = parser.parse();
        expect(result).to.be.deep.eq(new ExportSequenceNode(new FunctionNode("move",
            new ExportNode(new StringNode("when")),
            null,
            new VariableNode(new StringNode("direction"))),
            new CallFunctionNode(new StringNode("move"), new AssignmentNode(new StringNode("direction"), new StringNode("UP")))),
        );
    }

    @test public "given function is called twice"() {
        const statement = `then move in the direction UP then move in the direction down`;
        const parser = new ParsingService(WordService.create(statement));
        const result = parser.parse();
        expect(result).to.be.deep.eq(new ExportSequenceNode(
            new CallFunctionNode(new StringNode("move"), new AssignmentNode(new StringNode("direction"), new StringNode("UP"))),
            new CallFunctionNode(new StringNode("move"), new AssignmentNode(new StringNode("direction"), new StringNode("down"))),
            ),
        );
    }
}