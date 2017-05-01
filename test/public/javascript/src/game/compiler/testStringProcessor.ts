import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    StringProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import { AnyValueNode, ClassNode, StringNode } from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

@suite("[StringProcessor] When requesting a node from the string processor")
class CanHandle {
    private processor: StringProcessor;

    public before() {
        this.processor = new StringProcessor();
    }

    @test public "it can handle, it should have responded with can handle"() {
        const node = new StringNode("class");
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

@suite("[StringProcessor] When requesting a node from the string processor")
class Process {
    private processor: StringProcessor;

    public before() {
        this.processor = new StringProcessor();
    }

    @test public "a perfect class"() {
        const node = new StringNode("value");

        const result = this.processor.process(node);
        expect(result).to.be.eq("value");
    }
}