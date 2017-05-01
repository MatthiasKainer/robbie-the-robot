import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import { ClassProcessor } from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import { AnyValueNode, ClassNode } from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

@suite("[ClassProcessor] When requesting a node from the class processor")
class CanHandle {
    private machine: Machine;
    private classProcessor: ClassProcessor;

    public before() {
        this.machine = new Machine();
        this.classProcessor = new ClassProcessor(this.machine);
    }

    @test public "it can handle, it should have responded with can handle"() {
        const classNode = new ClassNode("class");
        const result = this.classProcessor.canHandle(classNode);
        expect(result).to.be.true;
    }

    @test public "it's not a ClassNode handle, it should have responded with cannot handle"() {
        const classNode = new AnyValueNode("class");
        const result = this.classProcessor.canHandle(classNode);
        expect(result).to.be.false;
    }

    @test public "it's null, it should have responded with cannot handle"() {
        const result = this.classProcessor.canHandle(null);
        expect(result).to.be.false;
    }
}

@suite("[ClassProcessor] When requesting a node from the class processor")
class Process {
    private machine: Machine;
    private classProcessor: ClassProcessor;

    public before() {
        this.machine = new Machine();
        this.classProcessor = new ClassProcessor(this.machine);
    }

    @test public "a perfect class"() {
        const classNode = new ClassNode("class", {
            "field1": new AnyValueNode("1"),
            "field2": new AnyValueNode("2"),
        });

        const result = this.classProcessor.process(classNode);
        expect(result).to.deep.eq({
            field1: "1",
            field2: "2",
        });
    }
}