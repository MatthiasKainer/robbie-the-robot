import { LoopNode } from "../../../ast/availableNodes";
import { SyntaxNode } from "../../../ast/node";
import Machine from "../machine";
import { NodeProcessor } from "../nodeProcessor";

export class LoopProcessor implements NodeProcessor {
    public constructor(private machine: Machine) { }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "LoopNode";
    }

    public process(node: SyntaxNode): any {
        const loopNode = node as LoopNode;
        let from = null;
        const perform: any = null;
        this.machine.pushScope();
        if (loopNode.from) {
            from = this.machine.run(loopNode.from);
        }
        for (from; this.machine.run(loopNode.until); this.machine.run(loopNode.perform)) {
            this.machine.run(loopNode.body);
        }
        this.machine.popScope();
    }
}