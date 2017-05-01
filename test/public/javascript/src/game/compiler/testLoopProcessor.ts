import { Comparator, Operator } from "../../../../../../public/javascript/src/ast/node";
import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    LoopProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import {
    AnyValueNode,
    AssignmentNode,
    ClassNode,
    ComparingNode,
    ExpandVariableNode,
    ExportNode,
    ExportSequenceNode,
    LoopNode,
    NumberNode,
    OperationNode,
    SequenceNode,
    StringNode,
    VariableNode,
} from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

@suite("[LoopProcessor] When requesting a node from the processor")
class CanHandle {
    private machine: Machine;
    private processor: LoopProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new LoopProcessor(this.machine);
    }

    @test public "that it can handle, it should have responded with can handle"() {
        const node = new LoopNode(null, null);
        const result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test public "that's not a SequenceNode, it should have responded with cannot handle"() {
        const node = new AnyValueNode("class");
        const result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test public "that's null, it should have responded with cannot handle"() {
        const result = this.processor.canHandle(null);
        expect(result).to.be.false;
    }
}

@suite("[LoopProcessor] When requesting a node from the class processor")
class Process {
    private machine: Machine;
    private processor: LoopProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new LoopProcessor(this.machine);
    }

    @test public "a while(until) loop"() {
        const body = new AssignmentNode(new StringNode("result"),
            new OperationNode(Operator.Add, new ExpandVariableNode(new StringNode("result")), new NumberNode(1)),
        );
        const loop = new LoopNode(body,
            new ComparingNode(Comparator.SmallerOrEqual, new ExpandVariableNode(new StringNode("result")), new NumberNode(10)),
        );

        const node = new ExportSequenceNode(new VariableNode(new StringNode("result")),
            new AssignmentNode(new StringNode("result"), new NumberNode(0)),
            loop,
            new ExportNode(new StringNode("result")));
        const result = this.machine.run(node);
        expect(result).to.deep.eq(11);
    }

    @test public "a for;until;do loop"() {
        const from = new ExportSequenceNode(new VariableNode(new StringNode("i")),
            new AssignmentNode(new StringNode("i"), new NumberNode(0)),
            new ExportNode(new StringNode("i")));
        const body = new AssignmentNode(new StringNode("result"), new ExpandVariableNode(new StringNode("i")));
        const loop = new LoopNode(body,
            new ComparingNode(Comparator.SmallerOrEqual, new ExpandVariableNode(new StringNode("i")), new NumberNode(10)),
            from,
            new AssignmentNode(new StringNode("i"),
                new OperationNode(Operator.Add, new ExpandVariableNode(new StringNode("i")), new NumberNode(1)),
            ),
        );

        const node = new ExportSequenceNode(new VariableNode(new StringNode("result")),
            loop,
            new ExportNode(new StringNode("result")));
        const result = this.machine.run(node);
        expect(result).to.deep.eq(10);
    }
}