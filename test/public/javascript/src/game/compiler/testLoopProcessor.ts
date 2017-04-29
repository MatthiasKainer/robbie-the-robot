import { Comparator, Operator } from '../../../../../../public/javascript/src/ast/node';
import Machine from '../../../../../../public/javascript/src/game/compiler/machine';
import mocha = require('mocha');
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
import {
    LoopProcessor
} from './../../../../../../public/javascript/src/game/compiler/availableNodeProcessors';
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
    VariableNode
} from './../../../../../../public/javascript/src/ast/availableNodes';
const expect = chai.expect;

@suite("[LoopProcessor] When requesting a node from the processor")
class CanHandle {
    machine : Machine;
    processor : LoopProcessor;

    before() {
        this.machine = new Machine();
        this.processor = new LoopProcessor(this.machine);
    }

    @test "that it can handle, it should have responded with can handle"() {
        let node = new LoopNode(null, null);
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

@suite("[LoopProcessor] When requesting a node from the class processor")
class Process {
    machine : Machine;
    processor : LoopProcessor;

    before() {
        this.machine = new Machine();
        this.processor = new LoopProcessor(this.machine);
    }
    
    @test "a while(until) loop"() {
        let body =  new AssignmentNode(new StringNode("result"), 
                new OperationNode(Operator.Add, new ExpandVariableNode(new StringNode("result")), new NumberNode(1))
            );
        let loop = new LoopNode(body, 
            new ComparingNode(Comparator.SmallerOrEqual, new ExpandVariableNode(new StringNode("result")), new NumberNode(10))           
        );

        let node = new ExportSequenceNode(new VariableNode(new StringNode("result")), 
            new AssignmentNode(new StringNode("result"), new NumberNode(0)),
            loop, 
            new ExportNode(new StringNode("result")));
        let result = this.machine.run(node);
        expect(result).to.deep.eq(11);
    }

    @test "a for;until;do loop"() {
        let from = new ExportSequenceNode(new VariableNode(new StringNode("i")), 
            new AssignmentNode(new StringNode("i"), new NumberNode(0)),
            new ExportNode(new StringNode("i")));
        let body = new AssignmentNode(new StringNode("result"), new ExpandVariableNode(new StringNode("i")));
        let loop = new LoopNode(body, 
            new ComparingNode(Comparator.SmallerOrEqual, new ExpandVariableNode(new StringNode("i")), new NumberNode(10)), 
            from, 
            new AssignmentNode(new StringNode("i"), 
                new OperationNode(Operator.Add, new ExpandVariableNode(new StringNode("i")), new NumberNode(1))
            )
        );

        let node = new ExportSequenceNode(new VariableNode(new StringNode("result")), 
            loop, 
            new ExportNode(new StringNode("result")));
        let result = this.machine.run(node);
        expect(result).to.deep.eq(10);
    }
}