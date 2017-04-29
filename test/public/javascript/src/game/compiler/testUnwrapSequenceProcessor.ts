import Machine from '../../../../../../public/javascript/src/game/compiler/machine';
import mocha = require('mocha');
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
import {
    LoopProcessor,
    UnwrapSequenceProcessor
} from './../../../../../../public/javascript/src/game/compiler/availableNodeProcessors';
import {
    AnyValueNode,
    AssignmentNode,
    ClassNode,
    ExpandVariableNode,
    NumberNode,
    SequenceNode,
    StringNode,
    UnwrapSequenceNode,
    VariableNode
} from './../../../../../../public/javascript/src/ast/availableNodes';
const expect = chai.expect;

@suite("[UnwrapSequenceProcessor] When requesting a node from the processor")
class CanHandle {
    machine : Machine;
    processor : UnwrapSequenceProcessor;

    before() {
        this.machine = new Machine();
        this.processor = new UnwrapSequenceProcessor(this.machine);
    }

    @test "that it can handle, it should have responded with can handle"() {
        let node = new UnwrapSequenceNode();
        let result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test "that's not a SequenceNode, it should have responded with cannot handle"() {
        let node = new AnyValueNode("class");
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test "that's null, it should have responded with cannot handle"() {
        let node = null;
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }
}

@suite("[UnwrapSequenceProcessor] When requesting a node from the class processor")
class Process {
    machine : Machine;
    processor : UnwrapSequenceProcessor;

    before() {
        this.machine = new Machine();
        this.processor = new UnwrapSequenceProcessor(this.machine);
    }

    @test "a perfect sequence"() {
        
        let positionData = new ClassNode("Position", {
            "row": new NumberNode(5),
            "column": new NumberNode(6)
        });

        let robotData = new ClassNode("Robot", {
            "position": positionData
        });
        
        let robotVariable = new VariableNode(new StringNode("robot"), new StringNode("Robot"));
        let assignedRobot = new AssignmentNode(new StringNode("robot"), robotData);

        let row = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("row")));
        let column = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
            new ExpandVariableNode(new StringNode("position")),
            new ExpandVariableNode(new StringNode("column")));
        let results = this.machine.run(new SequenceNode(robotVariable, assignedRobot, row, column));

        expect(results).to.deep.eq([true, true, 5, 6]);
    }
}