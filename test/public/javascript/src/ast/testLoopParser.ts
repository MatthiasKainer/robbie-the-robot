import { LoopParser } from '../../../../../public/javascript/src/ast/availableParsers';
import { ParsingService, WordService } from '../../../../../public/javascript/src/ast/parser';
import { Comparator, Operator, SyntaxNode } from '../../../../../public/javascript/src/ast/node';
import {
    AssignmentNode,
    ComparingNode,
    ExpandVariableNode,
    ExportNode,
    ExportSequenceNode,
    LoopNode,
    NumberNode,
    OperationNode,
    StringNode,
    VariableNode
} from '../../../../../public/javascript/src/ast/availableNodes';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
const expect = chai.expect;

let trigger = "while";

@suite("[LoopParser] When asking if the parser can parse word")
class ShouldParseFunction {
    parser : LoopParser = new LoopParser(new ParsingService([]));

    @test("given the word should start the parser")
    public start() {
        expect(this.parser.activate(trigger)).to.be.true;
    }

    @test("given the word should not start the parser")
    public dont() {
        expect(this.parser.activate("anythingnotatrigger")).to.be.false;
        expect(this.parser.activate("")).to.be.false;
    }
}

@suite("[LoopParser] When trying to parse a for(from; until; do; too much; stuff) loop")
class TestFromUntilDoAndErrorParser {
    input = `while (the i is 0 & our i is < 10 & i is our i + 1 & export 1 & our robot) ( )`;

    @test("validate expectation")
    public test() {
        let parser = new ParsingService(WordService.create(this.input));
        let result = null;
        try 
        {
            parser.parse();
        } catch (err) {
            result = err;
        }
        expect(result).not.null;
    }
}

@suite("[LoopParser] When trying to parse a for(from; until; do) loop")
class TestFromUntilDoParser {
    input = `while (the i is 0&our i  < 10 & i is our i+1) ( export i )`;
    expect = new LoopNode(new ExportNode(new StringNode("i")), new ComparingNode(Comparator.Smaller, new ExpandVariableNode(new StringNode("i")), new NumberNode(10)), new ExportSequenceNode(new VariableNode(new StringNode("i")), new AssignmentNode(new StringNode("i"), new NumberNode(0)), new ExportNode(new StringNode("i"))),
        new AssignmentNode(new ExpandVariableNode(new StringNode("i")), new OperationNode(Operator.Add, new ExpandVariableNode(new StringNode("i")), new NumberNode(1))));
    
    @test("validate expectation")
    public test() {
        let parser = new ParsingService(WordService.create(this.input));
        let result = parser.parse();
        expect(expect).not.to.be.deep.eq(result);
    }
}

@suite("[LoopParser] When trying to parse a for(from; until) loop")
class TestFromUntilParser {
    input = `while (the i is 0 & our i<10) ( )`;
    expect = new LoopNode(null, new ComparingNode(Comparator.Smaller, new ExpandVariableNode(new StringNode("i")), new NumberNode(10)), new ExportSequenceNode(new VariableNode(new StringNode("i")), new AssignmentNode(new StringNode("i"), new NumberNode(0)), new ExportNode(new StringNode("i"))));

    @test("validate expectation")
    public test() {
        let parser = new ParsingService(WordService.create(this.input));
        let result = parser.parse();
        expect(expect).not.to.be.deep.eq(result);
    }
}

@suite("[LoopParser] When trying to parse a while(until) loop")
class TestWhileParser {
    input = `while (our i < 10) ()`;
    expect = new LoopNode(null, new ComparingNode(Comparator.Smaller, new ExpandVariableNode(new StringNode("i")), new NumberNode(10)));

    @test("validate expectation")
    public test() {
        let parser = new ParsingService(WordService.create(this.input));
        let result = parser.parse();
        expect(expect).not.to.be.deep.eq(result);
    }
}