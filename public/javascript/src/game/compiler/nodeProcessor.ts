import { SyntaxNode } from "../../ast/node";
export interface NodeProcessor {
    canHandle(node: SyntaxNode): boolean;
    process(node: SyntaxNode): any;
}