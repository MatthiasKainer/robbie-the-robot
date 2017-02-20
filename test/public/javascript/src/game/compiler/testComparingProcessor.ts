import { Comparator, Operator, SyntaxNode } from '../../../../../../public/javascript/src/ast/node';
import Machine from '../../../../../../public/javascript/src/game/compiler/machine';
import mocha = require('mocha');
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
import {
    ComparingProcessor
} from './../../../../../../public/javascript/src/game/compiler/availableNodeProcessors';
import {
    AnyValueNode,
    ComparingNode,
    StringNode
} from './../../../../../../public/javascript/src/ast/availableNodes';
const expect = chai.expect;

let name = "name";
let node = new ComparingNode(Comparator.Equal, new StringNode(name), new StringNode(name));

@suite("[ComparingProcessor] When requesting a node")
class CanHandle {
    machine: Machine;
    processor: ComparingProcessor;

    before() {
        this.machine = new Machine();
        this.processor = new ComparingProcessor(this.machine);
    }

    @test("it can handle, it should have responded with can handle")
    asserts_classNode() {
        let result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test("it's not a ClassNode handle, it should have responded with cannot handle")
    asserts_otherNode() {
        let node = new AnyValueNode("class");
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

@suite("[ComparingProcessor] When requesting a node from the processor")
class Process {
    machine: Machine;
    processor: ComparingProcessor;

    before() {
        this.machine = new Machine();
        this.processor = new ComparingProcessor(this.machine);
    }

    @test("an equal comparison")
    asserts_classNode() {
        let result = this.processor.process(node);
        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.true;
    }
}