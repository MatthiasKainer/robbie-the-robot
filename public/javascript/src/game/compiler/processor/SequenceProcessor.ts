import Machine from '../machine';
import { SyntaxNode } from '../../../ast/node';
import { SequenceNode } from '../../../ast/availableNodes';
import { NodeProcessor } from '../nodeProcessor';

export class SequenceProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "SequenceNode";
    }

    public process(node: SyntaxNode): any {
        let sequence = node as SequenceNode;
        return sequence.children.map(_ => {
            return this.machine.run(_);
        });
    }
}