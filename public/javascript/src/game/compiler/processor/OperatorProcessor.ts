import { OperationNode } from "../../../ast/availableNodes";
import { Operator, SyntaxNode } from "../../../ast/node";
import Machine from "../machine";
import { NodeProcessor } from "../nodeProcessor";

export class OperatorProcessor implements NodeProcessor {
    public constructor(private machine: Machine) { }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "OperationNode";
    }

    public process(node: SyntaxNode): any {
        const operator = node as OperationNode;
        switch (operator.operator) {
            case Operator.Add:
                return this.machine.run(operator.left) + this.machine.run(operator.right);
            case Operator.Substract:
                return this.machine.run(operator.left) - this.machine.run(operator.right);
            case Operator.Divide:
                return this.machine.run(operator.left) / this.machine.run(operator.right);
            case Operator.Multiply:
                return this.machine.run(operator.left) * this.machine.run(operator.right);
        }

        return false;
    }
}