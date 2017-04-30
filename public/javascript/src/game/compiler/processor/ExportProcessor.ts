import { ExportNode } from "../../../ast/availableNodes";
import { SyntaxNode } from "../../../ast/node";
import Machine from "../machine";
import { NodeProcessor } from "../nodeProcessor";

export class ExportProcessor implements NodeProcessor {
    public constructor(private machine: Machine) { }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "ExportNode";
    }

    public process(node: SyntaxNode): any {
        return this.machine.getScope().getVariable(this.machine.run((node as ExportNode).identifier));
    }
}