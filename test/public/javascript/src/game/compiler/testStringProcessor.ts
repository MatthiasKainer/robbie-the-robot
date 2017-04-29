import Machine from '../../../../../../public/javascript/src/game/compiler/machine';
import mocha = require('mocha');
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
import {
    StringProcessor
} from './../../../../../../public/javascript/src/game/compiler/availableNodeProcessors';
import { AnyValueNode, ClassNode, StringNode } from './../../../../../../public/javascript/src/ast/availableNodes';
const expect = chai.expect;

@suite("[StringProcessor] When requesting a node from the string processor")
class CanHandle {
    processor : StringProcessor;

    before() {
        this.processor = new StringProcessor();
    }

    @test "it can handle, it should have responded with can handle"() {
        let node = new StringNode("class");
        let result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test "it's a different node type, it should have responded with cannot handle"() {
        let node = new ClassNode("class");
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test "it's null, it should have responded with cannot handle"() {
        let node = null;
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }
}

@suite("[StringProcessor] When requesting a node from the string processor")
class Process {
    processor : StringProcessor;

    before() {
        this.processor = new StringProcessor();
    }

    @test "a perfect class"() {
        let node = new StringNode("value");

        let result = this.processor.process(node);
        expect(result).to.be.eq("value")
    }
}