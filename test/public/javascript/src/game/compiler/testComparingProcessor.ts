import { Comparator, Operator, SyntaxNode } from "../../../../../../public/javascript/src/ast/node";
import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    ComparingProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import {
    AnyValueNode,
    ComparingNode,
    StringNode,
} from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

const name = "name";
const node = new ComparingNode(Comparator.Equal, new StringNode(name), new StringNode(name));

@suite("[ComparingProcessor] When requesting a node")
class CanHandle {
    private machine: Machine;
    private processor: ComparingProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new ComparingProcessor(this.machine);
    }

    @test public "it can handle, it should have responded with can handle"() {
        const result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test public "it's not a ClassNode handle, it should have responded with cannot handle"() {
        const node = new AnyValueNode("class");
        const result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test public "it's null, it should have responded with cannot handle"() {
        const result = this.processor.canHandle(null);
        expect(result).to.be.false;
    }
}

@suite("[ComparingProcessor] When requesting a node from the processor")
class Process {
    private machine: Machine;
    private processor: ComparingProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new ComparingProcessor(this.machine);
    }

    @test public "an equal comparison"() {
        const result = this.processor.process(node);
        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.true;
    }
}