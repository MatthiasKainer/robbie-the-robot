import Machine from "../../../../../../public/javascript/src/game/compiler/machine";
import mocha = require("mocha");
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import chai = require("chai");
import * as sinon from "sinon";
import {
    SwitchProcessor,
} from "./../../../../../../public/javascript/src/game/compiler/availableNodeProcessors";
import {
    AnyValueNode,
    ClassNode,
    SwitchComparisonNode,
    SwitchNode,
} from "./../../../../../../public/javascript/src/ast/availableNodes";
const expect = chai.expect;

const switchNode = new SwitchNode(new AnyValueNode("RIGHT"),
    new SwitchComparisonNode(new AnyValueNode("UP"),
        new AnyValueNode(false)),
    new SwitchComparisonNode(new AnyValueNode("RIGHT"),
        new AnyValueNode(true)),
    new SwitchComparisonNode(new AnyValueNode("LEFT"),
        new AnyValueNode(false)),
);

@suite("[SwitchProcessor] When requesting a node")
class CanHandle {
    private machine: Machine;
    private processor: SwitchProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new SwitchProcessor(this.machine);
    }

    @test public "it can handle, it should have responded with can handle"() {
        const result = this.processor.canHandle(switchNode);
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

@suite("[SwitchProcessor] When requesting a node from the class processor")
class Process {
    private machine: Machine;
    private processor: SwitchProcessor;

    public before() {
        this.machine = new Machine();
        this.processor = new SwitchProcessor(this.machine);
    }

    @test public "a perfect class"() {

        const result = this.processor.process(switchNode);
        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.be.true;
    }

    @test public "a non-matching switch"() {
        const switchNode = new SwitchNode(new AnyValueNode("DOWN"),
            new SwitchComparisonNode(new AnyValueNode("UP"),
                new AnyValueNode(false)),
            new SwitchComparisonNode(new AnyValueNode("RIGHT"),
                new AnyValueNode(false)),
            new SwitchComparisonNode(new AnyValueNode("LEFT"),
                new AnyValueNode(false)),
        );
        const result = this.processor.process(switchNode);
        expect(result).to.be.null;
    }

    @test public "a default matcher for the switch"() {
        const switchNode = new SwitchNode(new AnyValueNode("DOWN"),
            new SwitchComparisonNode(new AnyValueNode("UP"),
                new AnyValueNode(false)),
            new SwitchComparisonNode(new AnyValueNode("RIGHT"),
                new AnyValueNode(false)),
            new SwitchComparisonNode(new AnyValueNode("LEFT"),
                new AnyValueNode(false)),
            new SwitchComparisonNode(null,
                new AnyValueNode(true)),
        );
        const result = this.processor.process(switchNode);
        expect(result).not.undefined;
        expect(result).not.null;
        expect(result).to.be.true;
    }
}