import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    AnyValueProcessor
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import { AnyValueNode, ClassNode } from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

@suite("[AnyValueProcessor] When requesting a node from the anyvalue processor")
class CanHandle {
    processor : AnyValueProcessor;

    before() {
        this.processor = new AnyValueProcessor();
    }

    @test "it can handle, it should have responded with can handle" () {
        let node = new AnyValueNode("class");
        let result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test "it"s a different node type, it should have responded with cannot handle" () {
        let node = new ClassNode("class");
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test "it"s null, it should have responded with cannot handle" () {
        let node = null;
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }
}

@suite("[AnyValueProcessor] When requesting a node from the anyvalue processor")
class Process {
    processor : AnyValueProcessor;

    before() {
        this.processor = new AnyValueProcessor();
    }

    @test "a perfect class" () {
        let node = new AnyValueNode("value");

        let result = this.processor.process(node);
        expect(result).to.be.eq("value")
    }
}