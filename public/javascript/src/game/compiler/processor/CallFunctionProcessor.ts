import { CallFunctionNode } from '../../../ast/availableNodes';
import { SyntaxNode } from '../../../ast/node';
import Machine from '../machine';
import { NodeProcessor } from '../nodeProcessor';
export class CallFunctionProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "CallNode";
    }

    public process(node: SyntaxNode): any {
        let caller = node as CallFunctionNode;
        let fun = this.machine.getScope().getFunction(this.machine.run(caller.function));
        this.machine.pushScope();
        fun.arguments.forEach(_ => this.machine.run(_));
        caller.arguments.forEach(_ => this.machine.run(_));
        let result = this.machine.run(fun.operation);
        this.machine.popScope();
        return result;
    }
}