import Machine from '../../../../../../public/javascript/src/game/compiler/machine';
import mocha = require('mocha');
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
import { ClassProcessor } from './../../../../../../public/javascript/src/game/compiler/availableNodeProcessors';
import { AnyValueNode, ClassNode } from './../../../../../../public/javascript/src/ast/availableNodes';
const expect = chai.expect;

@suite("[ClassProcessor] When requesting a node from the class processor")
class CanHandle {
    machine : Machine;
    classProcessor : ClassProcessor;

    before() {
        this.machine = new Machine();
        this.classProcessor = new ClassProcessor(this.machine);
    }

    @test "it can handle, it should have responded with can handle"() {
        let classNode = new ClassNode("class");
        let result = this.classProcessor.canHandle(classNode);
        expect(result).to.be.true;
    }

    @test "it's not a ClassNode handle, it should have responded with cannot handle"() {
        let classNode = new AnyValueNode("class");
        let result = this.classProcessor.canHandle(classNode);
        expect(result).to.be.false;
    }

    @test "it's null, it should have responded with cannot handle"() {
        let classNode = null;
        let result = this.classProcessor.canHandle(classNode);
        expect(result).to.be.false;
    }
}

@suite("[ClassProcessor] When requesting a node from the class processor")
class Process {
    machine : Machine;
    classProcessor : ClassProcessor;

    before() {
        this.machine = new Machine();
        this.classProcessor = new ClassProcessor(this.machine);
    }

    @test "a perfect class"() {
        let classNode = new ClassNode("class", {
            "field1" : new AnyValueNode("1"),
            "field2" : new AnyValueNode("2")
        });

        let result = this.classProcessor.process(classNode);
        expect(result).to.deep.eq({
            field1 : "1",
            field2 : "2"
        })
    }
}