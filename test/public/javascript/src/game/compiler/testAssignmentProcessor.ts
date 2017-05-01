import { SyntaxNode } from "../../../../../../public/javascript/src/ast/node";
import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    AssignmentProcessor,
    SwitchProcessor,
    VariableProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import {
    AnyValueNode,
    AssignmentNode,
    StringNode,
    VariableNode,
} from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

const name = "name";
const variable = new VariableNode(new StringNode(name));
const node = new AssignmentNode(new StringNode(name), new StringNode("value"));

@suite("[AssignmentProcessor] When requesting a node")
class CanHandle {
    private machine: Machine;
    private processor: AssignmentProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new AssignmentProcessor(this.machine);
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

@suite("[AssignmentProcessor] When requesting a node from the processor")
class Process {
    private machine: Machine;
    private processor: AssignmentProcessor;

    public before() {
        this.machine = new Machine();
        this.machine.getScope().putVariable(name);
        this.processor = new AssignmentProcessor(this.machine);
    }

    @test public "an existing variable"() {
        const result = this.processor.process(node);
        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.be.true;
        expect(this.machine.getScope().getVariable(name)).to.be.equal("value");
    }

    @test public "an non-existing variable"() {
        let error = null;
        try {
            this.processor.process(
                    new AssignmentNode(new StringNode("nonexisting"), new StringNode("data")));
        } catch (err) {
            error = err;
        }
        expect(error).not.to.be.null;
        expect(error.message).to.be.eq("Variable \"nonexisting\" does not exist");
    }

    @test public "overwrite an existing variable with the same name in an inner scope should keep value"() {
        this.processor.process(node);
        this.machine.pushScope();
        this.processor.process(
            new AssignmentNode(new StringNode(name), new StringNode("overwrite")));
        this.machine.popScope();

        expect(this.machine.getScope().getVariable(name)).to.be.equal("overwrite");
    }

    @test public "overwrite an new variable with the same name in an inner scope should keep value"() {
        this.processor.process(node);
        this.machine.pushScope();
        this.machine.getScope().putVariable(name);
        this.processor.process(
            new AssignmentNode(new StringNode(name), new StringNode("overwrite")));
        expect(this.machine.getScope().getVariable(name)).to.be.equal("overwrite");
        this.machine.popScope();

        expect(this.machine.getScope().getVariable(name)).to.be.equal("value");
    }
}