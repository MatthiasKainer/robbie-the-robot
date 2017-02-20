import { SyntaxNode } from '../../../ast/node';
import { AnyValueNode } from '../../../ast/availableNodes';
import { NodeProcessor } from '../nodeProcessor';

export class AnyValueProcessor implements NodeProcessor {

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "AnyValueNode";
    }

    public process(node: SyntaxNode): any {
        return (node as AnyValueNode).value;
    }
}