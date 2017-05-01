import { Comparator, Operator, SyntaxNode } from "../../../../../../public/javascript/src/ast/node";
import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    CallFunctionProcessor,
    ComparingProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import {
    AnyValueNode,
    AssignmentNode,
    CallFunctionNode,
    ComparingNode,
    ExportNode,
    FunctionNode,
    SequenceNode,
    StringNode,
    VariableNode,
} from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

const name = "name";
const arg = "arg";
const fun = new FunctionNode(name, new ExportNode(new StringNode(arg)), "string", new VariableNode(new StringNode(arg)));
const node = new CallFunctionNode(new StringNode(name),
    new AssignmentNode(new StringNode(arg), new StringNode("value")));

@suite("[CallFunctionProcessor] When requesting a node")
class CanHandle {
    private machine: Machine;
    private processor: CallFunctionProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new CallFunctionProcessor(this.machine);
    }

    @test public "it can handle, it should have responded with can handle"() {
        const result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test public "it's not a ClassNode handle, it should have responded with cannot handle"() {
        const node = new AnyValueNode("class");
        const result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test public "it's null, it should have responded with cannot handle"() {
        const result = this.processor.canHandle(null);
        expect(result).to.be.false;
    }
}

@suite("[CallFunctionProcessor] When requesting a node from the processor")
class Process {
    private machine: Machine;

    public before() {
        this.machine = new Machine();
    }

    @test public "an equal comparison"() {
        const root = new SequenceNode(fun, node);
        const result = this.machine.run(root);
        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.be.deep.eq([true, "value"]);
    }
}