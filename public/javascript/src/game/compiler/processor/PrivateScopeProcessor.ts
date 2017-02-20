import { ExportNode, ScopeNode } from '../../../ast/availableNodes';
import { SyntaxNode } from '../../../ast/node';
import Machine from '../machine';
import { NodeProcessor } from '../nodeProcessor';

export class PrivateScopeProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "PrivateScopeNode";
    }

    public process(node: SyntaxNode): any {
        this.machine.pushPrivateScope();
        let scopedNode = node as ScopeNode;
        let result = null;
        scopedNode.children.find(child => {
            result = this.machine.run(child);
            if (child.type === ExportNode.name) return true;
        });

        this.machine.popScope();
        return result;
    }
}