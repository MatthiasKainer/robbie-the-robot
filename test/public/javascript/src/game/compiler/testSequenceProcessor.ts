import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    SequenceProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import {
    AnyValueNode,
    ClassNode,
    SequenceNode,
    StringNode,
} from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

@suite("[SequenceProcessor] When requesting a node from the processor")
class CanHandle {
    private machine: Machine;
    private processor: SequenceProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new SequenceProcessor(this.machine);
    }

    @test public "that it can handle, it should have responded with can handle"() {
        const node = new SequenceNode();
        const result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test public "that's not a SequenceNode, it should have responded with cannot handle"() {
        const node = new AnyValueNode("class");
        const result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test public "that's null, it should have responded with cannot handle"() {
        const result = this.processor.canHandle(null);
        expect(result).to.be.false;
    }
}

@suite("[SequenceProcessor] When requesting a node from the class processor")
class Process {
    private machine: Machine;
    private processor: SequenceProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new SequenceProcessor(this.machine);
    }

    @test public "a perfect sequence"() {
        const node = new SequenceNode(new StringNode("1"), new AnyValueNode(true));

        const result = this.processor.process(node);
        expect(result).to.deep.eq(["1", true]);
    }
}