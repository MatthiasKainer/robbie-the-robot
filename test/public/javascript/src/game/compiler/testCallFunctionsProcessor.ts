import { Comparator, Operator, SyntaxNode } from '../../../../../../public/javascript/src/ast/node';
import Machine from '../../../../../../public/javascript/src/game/compiler/machine';
import mocha = require('mocha');
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
import {
    CallFunctionProcessor,
    ComparingProcessor
} from './../../../../../../public/javascript/src/game/compiler/availableNodeProcessors';
import {
    AnyValueNode,
    AssignmentNode,
    CallFunctionNode,
    ComparingNode,
    ExportNode,
    FunctionNode,
    SequenceNode,
    StringNode,
    VariableNode
} from './../../../../../../public/javascript/src/ast/availableNodes';
const expect = chai.expect;

let name = "name";
let arg = "arg";
let fun = new FunctionNode(name, new ExportNode(new StringNode(arg)), "string", new VariableNode(new StringNode(arg)));
let node = new CallFunctionNode(new StringNode(name), 
    new AssignmentNode(new StringNode(arg), new StringNode("value")));

@suite("[CallFunctionProcessor] When requesting a node")
class CanHandle {
    machine: Machine;
    processor: CallFunctionProcessor;

    before() {
        this.machine = new Machine();
        this.processor = new CallFunctionProcessor(this.machine);
    }

    @test "it can handle, it should have responded with can handle"() {
        let result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test "it's not a ClassNode handle, it should have responded with cannot handle"() {
        let node = new AnyValueNode("class");
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test "it's null, it should have responded with cannot handle"() {
        let node = null;
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }
}

@suite("[CallFunctionProcessor] When requesting a node from the processor")
class Process {
    machine: Machine;

    before() {
        this.machine = new Machine();
    }

    @test "an equal comparison"() {
        let root= new SequenceNode(fun, node);
        let result = this.machine.run(root);
        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.be.deep.eq([true, "value"]);
    }
}