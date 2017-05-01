import { Comparator, Operator, SyntaxNode } from "./node";

/**
 * Creates a new private scope for the passed children
 */
export class PrivateScopeNode implements SyntaxNode {
    public type: string = "PrivateScopeNode";
    public parent: SyntaxNode;
    public children: SyntaxNode[];

    constructor(...args: SyntaxNode[]) {
        this.children = args;
    }
}

/**
 * Creates a new scope for the passed children
 */
export class ScopeNode implements SyntaxNode {
    public type: string = "ScopeNode";
    public parent: SyntaxNode;
    public children: SyntaxNode[];

    constructor(...args: SyntaxNode[]) {
        this.children = args;
    }
}

/**
 * Creates a function
 */
export class FunctionNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "FunctionNode";
    public name: string;
    public arguments: VariableNode[];
    public returnType: string | SyntaxNode;
    public operation: SyntaxNode;

    public constructor(name: string, operation: SyntaxNode, returnType?: string | SyntaxNode, ...args: VariableNode[]) {
        this.name = name;
        this.operation = operation;
        this.returnType = returnType;
        this.arguments = args;
    }
}

/**
 * Calls a function
 */
export class CallFunctionNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "CallNode";
    public function: SyntaxNode;
    public arguments: AssignmentNode[];

    public constructor(fun: SyntaxNode, ...args: AssignmentNode[]) {
        this.function = fun;
        this.arguments = args;
    }
}

/**
 * Performs an operation from @Operator
 */
export class OperationNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "OperationNode";
    public operator: Operator;
    public left: SyntaxNode;
    public right: SyntaxNode;
    constructor(operator: Operator, left: SyntaxNode, right: SyntaxNode) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

/**
 * Compares two node using a @Comparator
 */
export class ComparingNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "ComparingNode";
    public comparator: Comparator;
    public left: SyntaxNode;
    public right: SyntaxNode;

    public constructor(comparator: Comparator, left: SyntaxNode, right: SyntaxNode) {
        this.comparator = comparator;
        this.left = left;
        this.right = right;
    }
}

/**
 * Executes a sequence of statements
 */
export class SequenceNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "SequenceNode";
    public children: SyntaxNode[];
    public constructor(...children: SyntaxNode[]) {
        this.children = children || [];
    }
}

export class LoopNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "LoopNode";
    public from: SyntaxNode;
    public until: SyntaxNode;
    public body: SyntaxNode;
    public perform: SyntaxNode;
    public constructor(body: SyntaxNode, until: SyntaxNode, from: SyntaxNode = null, perform: SyntaxNode = null) {
        this.body = body;
        this.until = until;
        this.from = from;
        this.perform = perform;
    }
}

/**
 * Executes a sequence of statements
 */
export class ExportSequenceNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "ExportSequenceNode";
    public children: SyntaxNode[];
    public constructor(...children: SyntaxNode[]) {
        this.children = children || [];
    }
}

/**
 * Executes a sequence of statements, passing the result of each statement
 * as execution scope to the stack
 */
export class UnwrapSequenceNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "UnwrapSequenceNode";
    public children: SyntaxNode[];
    public constructor(...children: SyntaxNode[]) {
        this.children = children;
    }
}

/**
 * Creates a variable
 */
export class VariableNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "VariableNode";
    public variableType: SyntaxNode;
    public name: SyntaxNode;

    public constructor(name: SyntaxNode, type?: SyntaxNode) {
        this.name = name;
        this.variableType = type;
    }
}

/**
 * Assign a value to a variable
 */
export class AssignmentNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "AssignmentNode";
    public variableName: SyntaxNode;
    public value: SyntaxNode;

    public constructor(name: SyntaxNode, value: SyntaxNode) {
        this.variableName = name;
        this.value = value;
    }
}

/**
 * Retrieves a variable
 */
export class ExpandVariableNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "ExpandVariableNode";
    public variableName: SyntaxNode;
    public node: SyntaxNode;

    public constructor(variableName: SyntaxNode) {
        this.variableName = variableName;
    }
}

/**
 * Define a number primitive type
 */
export class NumberNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "NumberNode";
    public value: number;
    public constructor(value: number) {
        this.value = value;
    }
}

/**
 * Define a string primitive type
 */
export class StringNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "StringNode";
    public value: string;

    public constructor(value: string) {
        this.value = value;
    }
}

/**
 * Define a class-less type
 */
export class AnyValueNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "AnyValueNode";
    public value: any;

    public constructor(value: any) {
        this.value = value;
    }
}

/**
 * Create an instance of a type
 */
export class ClassNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "ClassNode";
    public dataType: string;
    public fields: { [index: string]: ClassNode | SyntaxNode };

    public constructor(dataType: string, fields?: { [index: string]: ClassNode | SyntaxNode }) {
        this.dataType = dataType;
        this.fields = fields;
    }
}

/**
 * Defines a switch statement
 */
export class SwitchNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "SwitchNode";
    public matches: SyntaxNode;
    public switches: SwitchComparisonNode[];

    public constructor(matches: SyntaxNode, ...switches: SwitchComparisonNode[]) {
        this.matches = matches;
        this.switches = switches;
    }
}

/**
 * A switch case
 */
export class SwitchComparisonNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "SwitchComparisonNode";
    public comparable: SyntaxNode;
    public operation: SyntaxNode;

    public constructor(compareable: SyntaxNode, operation?: SyntaxNode) {
        this.comparable = compareable;
        this.operation = operation;
    }
}

/**
 * Exports an identifier as result of an operation
 */
export class ExportNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "ExportNode";
    public identifier: SyntaxNode;

    public constructor(identifier: SyntaxNode) {
        this.identifier = identifier;
    }
}

/**
 * Notifies an external system of an event by an identifier
 */
export class NotifyNode implements SyntaxNode {
    public parent: SyntaxNode;
    public type: string = "NotifyNode";
    public identifier: SyntaxNode;
    public data: SyntaxNode;

    public constructor(identifier: SyntaxNode, data: SyntaxNode) {
        this.identifier = identifier;
        this.data = data;
    }
}