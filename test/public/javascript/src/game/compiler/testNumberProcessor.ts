import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    NumberProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import {
    NumberNode,
    StringNode,
} from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

@suite("[NumberProcessor] When requesting a node from the number processor")
class CanHandle {
    private processor: NumberProcessor;

    public before() {
        this.processor = new NumberProcessor();
    }

    @test public "it can handle, it should have responded with can handle"() {
        const node = new NumberNode(0);
        const result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test public "it's a different node type, it should have responded with cannot handle"() {
        const node = new StringNode("class");
        const result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test public "it's null, it should have responded with cannot handle"() {
        const result = this.processor.canHandle(null);
        expect(result).to.be.false;
    }
}

@suite("[NumberProcessor] When requesting a node from the number processor")
class Process {
    private processor: NumberProcessor;

    public before() {
        this.processor = new NumberProcessor();
    }

    @test public "a perfect class"() {
        const node = new NumberNode(1);
        const result = this.processor.process(node);
        expect(result).to.be.eq(1);
    }
}