import Machine from "../machine";
import { SyntaxNode } from "../../../ast/node";
import { ExpandVariableNode, SequenceNode } from "../../../ast/availableNodes";
import { NodeProcessor } from "../nodeProcessor";

export class UnwrapSequenceProcessor implements NodeProcessor {
    public constructor(private machine: Machine) { }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "UnwrapSequenceNode";
    }

    public process(node: SyntaxNode): any {
        const sequence = node as SequenceNode;
        let result = null;
        sequence.children.forEach(_ => {
            if (_.type === "ExpandVariableNode") {
                const current = this.machine.run(_);
                result = current;
                this.machine.pushPrivateScope();
                Object.keys(current).forEach(key => {
                    this.machine.getScope().putVariable(key);
                    this.machine.getScope().assignVariable(key, current[key]);
                });
            } else {
                this.machine.run(_);
            }
        });

        sequence.children.filter(_ => _.type === "ExpandVariableNode").reverse().forEach(_ => {
            const node = _ as ExpandVariableNode;
            const scope = Object.assign({}, this.machine.getScope().variables().all());
            this.machine.popScope();
            const variable = this.machine.getScope().getVariable(this.machine.run(node.variableName));
            if (variable instanceof Object) {
                Object.keys(variable).forEach(_ => {
                    variable[_] = scope[_];
                });
            }
        });

        return result;
    }
}