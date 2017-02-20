import Machine from '../../../../../../public/javascript/src/game/compiler/machine';
import mocha = require('mocha');
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
import {
    NumberProcessor
} from './../../../../../../public/javascript/src/game/compiler/availableNodeProcessors';
import {
    NumberNode,
    StringNode
} from './../../../../../../public/javascript/src/ast/availableNodes';
const expect = chai.expect;

@suite("[NumberProcessor] When requesting a node from the number processor")
class CanHandle {
    processor : NumberProcessor;

    before() {
        this.processor = new NumberProcessor();
    }

    @test("it can handle, it should have responded with can handle")
    asserts_classNode() {
        let node = new NumberNode(0);
        let result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test("it's a different node type, it should have responded with cannot handle")
    asserts_otherNode() {
        let node = new StringNode("class");
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test("it's null, it should have responded with cannot handle")
    asserts_emptyNode() {
        let node = null;
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }
}

@suite("[NumberProcessor] When requesting a node from the number processor")
class Process {
    processor : NumberProcessor;

    before() {
        this.processor = new NumberProcessor();
    }

    @test("a perfect class")
    asserts_classNode() {
        let node = new NumberNode(1);

        let result = this.processor.process(node);
        expect(result).to.be.eq(1)
    }
}