import { SyntaxNode } from "../../../ast/node";
import { StringNode } from "../../../ast/availableNodes";
import { NodeProcessor } from "../nodeProcessor";

export class StringProcessor implements NodeProcessor {

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "StringNode";
    }

    public process(node: SyntaxNode): any {
        return (node as StringNode).value;
    }
}