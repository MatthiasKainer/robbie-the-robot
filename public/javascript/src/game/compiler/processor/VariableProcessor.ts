import Machine from '../machine';
import { SyntaxNode } from '../../../ast/node';
import { VariableNode } from '../../../ast/availableNodes';
import { NodeProcessor } from '../nodeProcessor';

export class VariableProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "VariableNode";
    }

    public process(node: SyntaxNode): any {
        let variable = node as VariableNode;
        this.machine.getScope().putVariable(this.machine.run(variable.name));
        return true;
    }
}