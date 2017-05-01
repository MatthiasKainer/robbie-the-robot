import Machine from "../machine";
import { SyntaxNode } from "../../../ast/node";
import { VariableNode } from "../../../ast/availableNodes";
import { NodeProcessor } from "../nodeProcessor";

export class VariableProcessor implements NodeProcessor {
    public constructor(private machine: Machine) { }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "VariableNode";
    }

    public process(node: SyntaxNode): any {
        this.machine.getScope().putVariable(this.machine.run((node as VariableNode).name));
        return true;
    }
}