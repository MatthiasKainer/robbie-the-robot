import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    SwitchProcessor,
    VariableProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import { AnyValueNode, StringNode, VariableNode } from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

const node = new VariableNode(new StringNode("name"), new StringNode("type"));

@suite("[VariableProcessor] When requesting a node")
class CanHandle {
    public machine: Machine;
    public processor: VariableProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new VariableProcessor(this.machine);
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

@suite("[VariableProcessor] When requesting a node from the processor")
class Process {
    public machine: Machine;
    public processor: VariableProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new VariableProcessor(this.machine);
    }

    @test public "a perfect class"() {
        const result = this.processor.process(node);
        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.be.true;
    }

    @test public "an existing variable with the same name"() {
        let error = null;
        this.processor.process(node);
        try {
            this.processor.process(node);
        } catch (err) {
            error = err;
        }
        expect(error).not.to.be.null;
        expect(error.message).to.be.eq("Variable \"name\" was already defined in this scope");
    }

    @test public "an existing variable with the same name in an outer scope"() {
        let error = null;
        this.processor.process(node);
        try {
            this.machine.pushScope();
            this.processor.process(node);
        } catch (err) {
            error = err;
        }
        expect(error).to.be.null;
    }
}