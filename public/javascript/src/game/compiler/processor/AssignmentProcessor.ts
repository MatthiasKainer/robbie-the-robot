import Machine from "../machine";
import { SyntaxNode } from "../../../ast/node";
import { AssignmentNode } from "../../../ast/availableNodes";
import { NodeProcessor } from "../nodeProcessor";

export class AssignmentProcessor implements NodeProcessor {
    public constructor(private machine: Machine) { }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "AssignmentNode";
    }

    public process(node: SyntaxNode): any {
        const assignment = node as AssignmentNode;
        const name = this.machine.run(assignment.variableName);
        const value = this.machine.run(assignment.value);
        this.machine.getScope()
            .assignVariable(name, value);
        return true;
    }
}
