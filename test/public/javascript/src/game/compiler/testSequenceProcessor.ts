import Machine from '../../../../../../public/javascript/src/game/compiler/machine';
import mocha = require('mocha');
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
import {
    SequenceProcessor
} from './../../../../../../public/javascript/src/game/compiler/availableNodeProcessors';
import {
    AnyValueNode,
    ClassNode,
    SequenceNode,
    StringNode
} from './../../../../../../public/javascript/src/ast/availableNodes';
const expect = chai.expect;

@suite("[SequenceProcessor] When requesting a node from the processor")
class CanHandle {
    machine : Machine;
    processor : SequenceProcessor;

    before() {
        this.machine = new Machine();
        this.processor = new SequenceProcessor(this.machine);
    }

    @test("that it can handle, it should have responded with can handle")
    asserts_classNode() {
        let node = new SequenceNode();
        let result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test("that's not a SequenceNode, it should have responded with cannot handle")
    asserts_otherNode() {
        let node = new AnyValueNode("class");
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test("that's null, it should have responded with cannot handle")
    asserts_emptyNode() {
        let node = null;
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }
}

@suite("[SequenceProcessor] When requesting a node from the class processor")
class Process {
    machine : Machine;
    processor : SequenceProcessor;

    before() {
        this.machine = new Machine();
        this.processor = new SequenceProcessor(this.machine);
    }

    @test("a perfect sequence")
    asserts_classNode() {
        let node = new SequenceNode(new StringNode("1"), new AnyValueNode(true));

        let result = this.processor.process(node);
        expect(result).to.deep.eq(["1", true]);
    }
}