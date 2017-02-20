import { ComparingNode } from '../../../ast/availableNodes';
import { Comparator, SyntaxNode } from '../../../ast/node';
import Machine from '../machine';
import { NodeProcessor } from '../nodeProcessor';

export class ComparingProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "ComparingNode";
    }

    public process(node: SyntaxNode): any {
        let compare = node as ComparingNode;
        switch (compare.comparator) {
            case Comparator.Equal:
                return this.machine.run(compare.left) === this.machine.run(compare.right);
            case Comparator.Larger:
                return this.machine.run(compare.left) > this.machine.run(compare.right);
            case Comparator.LargerOrEqual:
                return this.machine.run(compare.left) >= this.machine.run(compare.right);
            case Comparator.NotEqual:
                return this.machine.run(compare.left) !== this.machine.run(compare.right);
            case Comparator.Smaller:
                return this.machine.run(compare.left) < this.machine.run(compare.right);
            case Comparator.SmallerOrEqual:
                return this.machine.run(compare.left) <= this.machine.run(compare.right);
        }

        return false;
    }
}