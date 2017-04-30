import Machine from "../machine";
import { SyntaxNode } from "../../../ast/node";
import { SwitchComparisonNode, SwitchNode } from "../../../ast/availableNodes";
import { NodeProcessor } from "../nodeProcessor";

export class SwitchProcessor implements NodeProcessor {
    public constructor(private machine: Machine) { }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "SwitchNode";
    }

    public process(node: SyntaxNode): any {
        let statementResult: any = null;
        if ((node as SwitchNode).switches.find(_ => {
            _.parent = node;
            statementResult = this.machine.run(_);
            return statementResult !== SwitchComparisonProcessor.NORESULT;
        })) { return statementResult; }

        return null;
    }
}

export class SwitchComparisonProcessor implements NodeProcessor {
    public static NORESULT = "SwitchComparisonProcessor_NORESULT";

    public constructor(private machine: Machine) { }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "SwitchComparisonNode";
    }

    public process(node: SyntaxNode): any {
        const comparisonNode = node as SwitchComparisonNode;
        const match = this.machine.run((comparisonNode.parent as SwitchNode).matches);
        const current = comparisonNode.comparable !== null ? this.machine.run(comparisonNode.comparable) : null;
        // no matcher = default
        if (current === null || match === current) {
            return this.machine.run(comparisonNode.operation);
        }
        return SwitchComparisonProcessor.NORESULT;
    }
}