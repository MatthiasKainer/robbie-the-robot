import { SyntaxNode } from "../../../../../../public/javascript/src/ast/node";
import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    AssignmentProcessor,
    ExpandVariableProcessor,
    SwitchProcessor,
    VariableProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import {
    AnyValueNode,
    AssignmentNode,
    ExpandVariableNode,
    StringNode,
    VariableNode,
} from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

const name = "name";
const variable = new VariableNode(new StringNode(name));
const assignemt = new AssignmentNode(new StringNode(name), new StringNode("value"));
const node = new ExpandVariableNode(new StringNode(name));

@suite("[ExpandVariableProcessor] When requesting a node")
class CanHandle {
    private machine: Machine;
    private processor: ExpandVariableProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new ExpandVariableProcessor(this.machine);
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

@suite("[ExpandVariableProcessor] When requesting a node from the processor")
class Process {
    private machine: Machine;
    private processor: ExpandVariableProcessor;

    public before() {
        this.machine = new Machine();
        this.machine.pushScope();
        this.machine.pushScope();
        this.machine.getScope().putVariable(name);
        this.machine.getScope().assignVariable(name, "value");
        this.processor = new ExpandVariableProcessor(this.machine);
    }

    @test public "an existing variable"() {
        const result = this.processor.process(node);
        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.be.eq("value");
    }

    @test public "an non-existing variable"() {
        let error = null;
        try {
            this.processor.process(
                new ExpandVariableNode(new StringNode("nonexisting")));
        } catch (err) {
            error = err;
        }
        expect(error).not.to.be.null;
        expect(error.message).to.be.eq("Variable \"nonexisting\" does not exist");
    }

    @test public "access variable in inner scope should work"() {
        this.machine.pushScope();
        const result = this.processor.process(node);

        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.be.eq("value");
    }

    @test public "access variable in outer scope should not work"() {
        let error = null;
        this.machine.popScope();

        try {
            this.processor.process(node);
        } catch (err) {
            error = err;
        }
        expect(error).not.to.be.null;
        expect(error.message).to.be.eq("Variable \"name\" does not exist");
    }
}