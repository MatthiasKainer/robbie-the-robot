import Machine from '../machine';
import { SyntaxNode } from '../../../ast/node';
import { ExpandVariableNode, SequenceNode } from '../../../ast/availableNodes';
import { NodeProcessor } from '../nodeProcessor';

export class UnwrapSequenceProcessor implements NodeProcessor {
    machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "UnwrapSequenceNode";
    }

    public process(node: SyntaxNode): any {
        let sequence = node as SequenceNode;
        let result = null;
        sequence.children.forEach(_ => {
            if (_.type === "ExpandVariableNode") {
                let current = this.machine.run(_);
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
            let node = _ as ExpandVariableNode;
            let scope = Object.assign({}, this.machine.getScope().variables().all());
            this.machine.popScope();
            let variableName = this.machine.run(node.variableName);
            let variable = this.machine.getScope().getVariable(variableName);
            if (variable instanceof Object) {
                Object.keys(variable).forEach(_ => {
                    variable[_] = scope[_];
                })
            }
        });

        return result;
    }
}