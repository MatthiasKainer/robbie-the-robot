import Machine from '../machine';
import { SyntaxNode } from '../../../ast/node';
import { AssignmentNode } from '../../../ast/availableNodes';
import { NodeProcessor } from '../nodeProcessor';

export class AssignmentProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "AssignmentNode";
    }

    public process(node: SyntaxNode): any {
        let assignment = node as AssignmentNode;
        let name = this.machine.run(assignment.variableName);
        let value = this.machine.run(assignment.value);
        this.machine.getScope()
            .assignVariable(name, value);
        return true;
    }
}
