import { SyntaxNode } from '../../../../../../public/javascript/src/ast/node';
import Machine from '../../../../../../public/javascript/src/game/compiler/machine';
import mocha = require('mocha');
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require('chai');
import * as sinon from 'sinon';
import {
    AssignmentProcessor,
    SwitchProcessor,
    VariableProcessor
} from './../../../../../../public/javascript/src/game/compiler/availableNodeProcessors';
import {
    AnyValueNode,
    AssignmentNode,
    StringNode,
    VariableNode
} from './../../../../../../public/javascript/src/ast/availableNodes';
const expect = chai.expect;

let name = "name";
let variable = new VariableNode(new StringNode(name));
let node = new AssignmentNode(new StringNode(name), new StringNode("value"));

@suite("[AssignmentProcessor] When requesting a node")
class CanHandle {
    machine: Machine;
    processor: AssignmentProcessor;

    before() {
        this.machine = new Machine();
        this.processor = new AssignmentProcessor(this.machine);
    }

    @test "it can handle, it should have responded with can handle"() {
        let result = this.processor.canHandle(node);
        expect(result).to.be.true;
    }

    @test "it's not a ClassNode handle, it should have responded with cannot handle"() {
        let node = new AnyValueNode("class");
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }

    @test "it's null, it should have responded with cannot handle"() {
        let node = null;
        let result = this.processor.canHandle(node);
        expect(result).to.be.false;
    }
}

@suite("[AssignmentProcessor] When requesting a node from the processor")
class Process {
    machine: Machine;
    processor: AssignmentProcessor;

    before() {
        this.machine = new Machine();
        this.machine.getScope().putVariable(name);
        this.processor = new AssignmentProcessor(this.machine);
    }

    @test "an existing variable"() {
        let result = this.processor.process(node);
        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.be.true;
        expect(this.machine.getScope().getVariable(name)).to.be.equal("value");
    }

    @test "an non-existing variable"() {
        let error = null;
        try {
            this.processor.process(
                    new AssignmentNode(new StringNode("nonexisting"), new StringNode("data")));
        } catch (err) {
            error = err;
        }
        expect(error).not.to.be.null;
        expect(error.message).to.be.eq("Variable 'nonexisting' does not exist");
    }

    @test "overwrite an existing variable with the same name in an inner scope should keep value"() {
        let error = null;
        this.processor.process(node);
        this.machine.pushScope();
        this.processor.process(
            new AssignmentNode(new StringNode(name), new StringNode("overwrite")))
        this.machine.popScope();

        expect(this.machine.getScope().getVariable(name)).to.be.equal("overwrite");
    }

    @test "overwrite an new variable with the same name in an inner scope should keep value"() {
        let error = null;
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