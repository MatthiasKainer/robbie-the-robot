import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    LoopProcessor,
    UnwrapSequenceProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import {
    AnyValueNode,
    AssignmentNode,
    ClassNode,
    ExpandVariableNode,
    NumberNode,
    SequenceNode,
    StringNode,
    UnwrapSequenceNode,
    VariableNode,
} from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

@suite("[UnwrapSequenceProcessor] When requesting a node from the processor")
class CanHandle {
    public machine: Machine;
    public processor: UnwrapSequenceProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new UnwrapSequenceProcessor(this.machine);
    }

    @test public "that it can handle, it should have responded with can handle"() {
        const node = new UnwrapSequenceNode();
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

@suite("[UnwrapSequenceProcessor] When requesting a node from the class processor")
class Process {
    public machine: Machine;
    public processor: UnwrapSequenceProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new UnwrapSequenceProcessor(this.machine);
    }

    @test public "a perfect sequence"() {

        const positionData = new ClassNode("Position", {
            "row": new NumberNode(5),
            "column": new NumberNode(6),
        });

        const robotData = new ClassNode("Robot", {
            "position": positionData,
        });

        const robotVariable = new VariableNode(new StringNode("robot"), new StringNode("Robot"));
        const assignedRobot = new AssignmentNode(new StringNode("robot"), robotData);

        const row = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("row")));
        const column = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("column")));
        const results = this.machine.run(new SequenceNode(robotVariable, assignedRobot, row, column));

        expect(results).to.deep.eq([true, true, 5, 6]);
    }
}