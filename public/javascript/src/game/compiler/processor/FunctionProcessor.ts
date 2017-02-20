import { FunctionNode } from '../../../ast/availableNodes';
import { SyntaxNode } from '../../../ast/node';
import Machine from '../machine';
import { NodeProcessor } from '../nodeProcessor';
export class FunctionProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "FunctionNode";
    }

    public process(node: SyntaxNode): any {
        this.machine.getScope().putFunction(node as FunctionNode);
        return true;
    }
}