import Machine from '../machine';
import { SyntaxNode } from '../../../ast/node';
import { SequenceNode } from '../../../ast/availableNodes';
import { NodeProcessor } from '../nodeProcessor';

export class ExportSequenceProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "ExportSequenceNode";
    }

    public process(node: SyntaxNode): any {
        let sequence = node as SequenceNode;
        let result = null;
        sequence.children.find(_ => {
            if (_.type === "ExportNode") {
                result = this.machine.run(_);
                return true;
            } else {
                this.machine.run(_);
                return false;
            }
        });

        return result;
    }
}