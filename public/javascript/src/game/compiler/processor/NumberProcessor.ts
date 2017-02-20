import { SyntaxNode } from '../../../ast/node';
import { NumberNode } from '../../../ast/availableNodes';
import { NodeProcessor } from '../nodeProcessor';

export class NumberProcessor implements NodeProcessor {

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "NumberNode";
    }

    public process(node: SyntaxNode): any {
        return (node as NumberNode).value;
    }
}