import { ExportNode, NotifyNode } from '../../../ast/availableNodes';
import { SyntaxNode } from '../../../ast/node';
import Machine from '../machine';
import { NodeProcessor } from '../nodeProcessor';

export class NotifyProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === NotifyNode.name;
    }

    public process(node: SyntaxNode): any {
        return this.machine.publish(
            this.machine.run((node as NotifyNode).identifier), 
            this.machine.run((node as NotifyNode).data));
    }
}