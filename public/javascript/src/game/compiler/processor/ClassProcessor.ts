import Machine from "../machine";
import { SyntaxNode } from "../../../ast/node";
import { ClassNode } from "../../../ast/availableNodes";
import { NodeProcessor } from "../nodeProcessor";

export class ClassProcessor implements NodeProcessor {
    private machine: Machine;

    public constructor(machine: Machine) {
        this.machine = machine;
    }

    public canHandle(node: SyntaxNode): boolean {
        return node !== null && node.type === "ClassNode";
    }

    public process(node: ClassNode | SyntaxNode): any {
        const classNode = node as ClassNode;
        const obj = {};
        Object.keys(classNode.fields).forEach(_ => {
            classNode.fields[_].parent = node;
            obj[_] = this.machine.run(classNode.fields[_]);
        });

        return obj;
    }
}