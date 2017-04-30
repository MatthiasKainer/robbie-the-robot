import Machine from "../machine";
import { SyntaxNode } from "../../../ast/node";
import { SequenceNode } from "../../../ast/availableNodes";
import { NodeProcessor } from "../nodeProcessor";

export class SequenceProcessor implements NodeProcessor {
    public constructor(private machine: Machine) { }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "SequenceNode";
    }

    public process(node: SyntaxNode): any {
        return (node as SequenceNode).children.map(_ => {
            return this.machine.run(_);
        });
    }
}