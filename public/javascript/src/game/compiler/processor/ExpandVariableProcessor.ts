import Machine from "../machine";
import { SyntaxNode } from "../../../ast/node";
import { ExpandVariableNode } from "../../../ast/availableNodes";
import { NodeProcessor } from "../nodeProcessor";

export class ExpandVariableProcessor implements NodeProcessor {
    private machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "ExpandVariableNode";
    }

    public process(node: SyntaxNode): any {
        const assignment = node as ExpandVariableNode;
        const name = this.machine.run(assignment.variableName);
        const result = this.machine.getScope()
            .getVariable(name);
        return result;
    }
}