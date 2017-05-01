import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    AnyValueProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import { AnyValueNode, ClassNode } from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

@suite("[AnyValueProcessor] When requesting a node from the anyvalue processor")
class CanHandle {
    private processor: AnyValueProcessor;

    public before() {
        this.processor = new AnyValueProcessor();
    }

    @test public "it can handle, it should have responded with can handle"() {
        const node = new AnyValueNode("class");
        const result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test public "it's a different node type, it should have responded with cannot handle"() {
        const node = new ClassNode("class");
        const result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test public "it's null, it should have responded with cannot handle"() {
        const result = this.processor.canHandle(null);
        expect(result).to.be.false;
    }
}

@suite("[AnyValueProcessor] When requesting a node from the anyvalue processor")
class Process {
    private processor: AnyValueProcessor;

    public before() {
        this.processor = new AnyValueProcessor();
    }

    @test public "a perfect class"() {
        const node = new AnyValueNode("value");

        const result = this.processor.process(node);
        expect(result).to.be.eq("value");
    }
}