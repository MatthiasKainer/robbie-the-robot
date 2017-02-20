import Machine from '../machine';
import { SyntaxNode } from '../../../ast/node';
import { SwitchComparisonNode, SwitchNode } from '../../../ast/availableNodes';
import { NodeProcessor } from '../nodeProcessor';

export class SwitchProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "SwitchNode";
    }

    public process(node: SyntaxNode): any {
        let switchNode = node as SwitchNode;
        let statementResult: any = null;
        if (switchNode.switches.find(_ => {
            _.parent = node;
            statementResult = this.machine.run(_);
            return statementResult !== SwitchComparisonProcessor.NORESULT;
        })) return statementResult;

        return null;
    }
}

export class SwitchComparisonProcessor implements NodeProcessor {
    machine: Machine;
    static NORESULT = "SwitchComparisonProcessor_NORESULT";

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "SwitchComparisonNode";
    }

    public process(node: SyntaxNode): any {
        let comparisonNode = node as SwitchComparisonNode;
        let switchNode = comparisonNode.parent as SwitchNode;
        let match = this.machine.run(switchNode.matches);
        let current = comparisonNode.comparable !== null ? this.machine.run(comparisonNode.comparable) : null;
        // no matcher = default
        if (current === null || match === current)
            return this.machine.run(comparisonNode.operation);
        return SwitchComparisonProcessor.NORESULT;
    }
}