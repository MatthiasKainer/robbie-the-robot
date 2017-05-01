import {
    AnyValueNode,
    AssignmentNode,
    CallFunctionNode,
    ClassNode,
    ComparingNode,
    ExpandVariableNode,
    ExportNode,
    ExportSequenceNode,
    FunctionNode,
    LoopNode,
    NotifyNode,
    NumberNode,
    OperationNode,
    ScopeNode,
    StringNode,
    SwitchComparisonNode,
    SwitchNode,
    UnwrapSequenceNode,
    VariableNode,
} from "./availableNodes";
import { runInThisContext } from "vm";
import { Comparator, Operator, SyntaxNode } from "./node";
import { Keywords, Parser, ParsingService, Word } from "./parser";

const loggingLevel: string = "silent";

export class WordParser implements Parser {
    public priority = 10000;

    public activate(word: string): boolean {
        return true;
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("WordParser reading " + word); }
        if (word.trim() === "") { return null; }
        if (!isNaN(word.trim() as any)) { return new NumberNode(parseInt(word)); }
        if (typeof word.trim() === "string") { return new StringNode(word); }
        return new AnyValueNode(word);
    }

    public done(): boolean {
        return true;
    }
}

export class StringRegionParser implements Parser {
    public priority: number = 500;
    private service: ParsingService;
    private isDone: boolean;
    private result: string;

    public constructor(service: ParsingService) {
        this.service = service;
        this.isDone = false;
        this.result = "";
    }

    public activate(word: string): boolean {
        const activate = word.indexOf("\"") === 0;
        this.isDone = !activate;
        return activate;
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("StringRegionParser reading " + word); }
        // check if string starts and ends with "
        if (word.indexOf("\"") === 0
            && word.lastIndexOf("\"") === word.length - 1
            && word.lastIndexOf("\\\"") !== word.length - 2) {
            this.isDone = true;
            return new StringNode(word.substring(1, word.length - 1));
        }

        this.result = this.result + " " + word;
        if (word !== "" && (
            word === "\"" ||
            (word.indexOf("\"") === word.length - 1 &&
                word.indexOf("\\\"") !== word.length - 2))) {
            if (loggingLevel === "verbose") { console.log(`StringRegionParser reader done for: "${word}"`); }
            this.isDone = true;
            return new StringNode(this.result.substring(2, this.result.length - 1));
        }
        return null;
    }

    public done(): boolean {
        return this.isDone;
    }
}

export class DoNothingParser implements Parser {
    public priority: number = 1;
    private service: ParsingService;

    public constructor(service: ParsingService) {
        this.service = service;
    }

    public activate(word: string): boolean {
        return Keywords.doNothings(this.service.language).some(_ => _ === word);
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("DoNothingParser reading " + word); }
        return null;
    }

    public done(): boolean {
        return true;
    }
}

export class LoopParser implements Parser {
    public priority: number = 1;
    private service: ParsingService;
    private isDone: boolean;
    private state: string;
    private parts: SyntaxNode[];

    public constructor(service: ParsingService) {
        this.service = service;
    }

    public activate(word: string): boolean {
        this.state = "InitConditions";
        this.isDone = false;
        this.parts = [];
        return Keywords.loop(this.service.language).some(_ => _ === word.trim());
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("LoopParser reading " + word); }
        if (Keywords.loop(this.service.language).some(_ => _ === word.trim()) &&
            this.state === "InitConditions") {
            return null;
        }
        word = word.trim();
        if (word === "") { return null; }
        /**
         * while (the i is 0 & our i is < 10 & i is our i + 1) (
         * )
         *
         * while (the i is 0 & our i is < 10)
         *
         * while (our i is < 10) (
         * )
         */
        switch (this.state) {
            case "InitConditions":
                if (!Keywords.scope(this.service.language).some(_ => _ === word)) {
                    throw new Error(`Loop requires a condition scope starting, instead received ${word}`);
                }
                this.state = "ReadConditions";
                return null;
            case "ReadConditions":
                this.parts.push(this.service.clone().revert(1).parseUntil(["&", ")"]));
                this.service.clone().revert(1);
                this.state = "NextOrEndConditions";
                return null;
            case "NextOrEndConditions":
                if (Keywords.end(this.service.language).some(_ => _ === word)) {
                    this.state = "Body";
                    return null;
                }
                if (Keywords.combine(this.service.language).some(_ => _ === word)) {
                    this.state = "ReadConditions";
                    return null;
                }
                throw new Error(`Loop required either an scope ending for conditions, or a combination of conditions. Instead received ${word}`);
            case "Body":
                let until = null;
                let from = null;
                let perform = null;
                if (this.parts.length < 1) {
                    throw new Error(`Loop received no information of the loop conditions, i.e. how long to loop`);
                }

                const getFromNode = (node: SyntaxNode) => {
                    const isAssignmentNode = (node: SyntaxNode) => {
                        return node.type === "AssignmentNode";
                    };

                    const getVariable = (node: AssignmentNode): SyntaxNode => {
                        return node.variableName;
                    };

                    let variable: SyntaxNode = null;
                    if (node.type === "ExportSequenceNode" && (node as ExportSequenceNode).children.some(child => {
                        if (isAssignmentNode(child)) {
                            variable = getVariable(child as AssignmentNode);
                            return true;
                        }
                        return false;
                    })) {
                        (node as ExportSequenceNode).children.push(new ExportNode(variable));
                    } else if (isAssignmentNode(node)) {
                        variable = getVariable(node as AssignmentNode);
                        node = new ExportSequenceNode(node, new ExportNode(variable));
                    } else {
                        throw new Error(`Could not retrieve variable name from "from" node. This is required for initialization of the loop. Instead received ${JSON.stringify(node)}`);
                    }

                    return node;
                };

                if (this.parts.length === 1) {
                    until = this.parts[0];
                } else if (this.parts.length === 2) {
                    from = getFromNode(this.parts[0]);
                    until = this.parts[1];
                } else if (this.parts.length === 3) {
                    from = getFromNode(this.parts[0]);
                    until = this.parts[1];
                    perform = this.parts[2];
                } else {
                    throw new Error(`Expected a maximum of 3 parts in loop condition, instead received ${this.parts.length}`);
                }

                this.isDone = true;
                return new LoopNode(this.service.clone().revert(1).parseOne(),
                    until,
                    from,
                    perform);
        }

        return null;
    }

    public done(): boolean {
        return this.isDone;
    }
}

export class OperationParser implements Parser {
    public priority: number = 1;
    private service: ParsingService;
    private isDone: boolean;
    private state: string;
    private current: OperationNode;

    public constructor(service: ParsingService) {
        this.service = service;
    }

    public activate(word: string): boolean {
        this.isDone = false;
        this.state = "Operator";
        return Keywords.operation(this.service.language).some(_ => _ === word);
    }

    public read(word: string): SyntaxNode {
        if (word.trim() === "") { return null; }

        switch (this.state) {
            case "Operator":
                this.current = new OperationNode(this.getOperator(word),
                    null,
                    null);
                this.state = "Right";
                return null;
            case "Right":
                break;
        }

        const currentNode = this.service.nodes.pop();
        let assignment: AssignmentNode;

        if (!currentNode) { throw new Error(`No node found before operation node.`); }
        if (currentNode.type === new AssignmentNode(null, null).type) {
            assignment = currentNode as AssignmentNode;
            const result = new AssignmentNode(assignment.variableName, new OperationNode(this.current.operator,
                assignment.value,
                this.service.clone().revert(1).parseOne()));
            if (loggingLevel === "verbose") {
                console.log(`Operation Parser result:
${JSON.stringify(result, undefined, 2)}`);
            }
            this.isDone = true;
            return result;
        } else if (currentNode.type === new UnwrapSequenceNode(null).type) {
            const unwrap = currentNode as UnwrapSequenceNode;
            for (let i = 0; i < unwrap.children.length; i++) {
                const current = unwrap.children[i];
                if (current.type === new AssignmentNode(null, null).type) {
                    assignment = current as AssignmentNode;
                    const result = new AssignmentNode(assignment.variableName, new OperationNode(this.current.operator,
                        assignment.value,
                        this.service.clone().revert(1).parseOne()));
                    unwrap.children[i] = result;

                    if (loggingLevel === "verbose") {
                        console.log(`Operation Parser result:
${JSON.stringify(unwrap, undefined, 2)}`);
                    }
                    this.isDone = true;
                    return unwrap;
                }
            }
        }

        throw new Error(`Illegal state for Operation Parser. Can only be a part of an assignment. Instead is part of ${currentNode.type}`);
    }

    public done(): boolean {
        return this.isDone;
    }

    private getOperator(word: string) {
        switch (word) {
            case "+":
                return Operator.Add;
            case "-":
                return Operator.Substract;
            case "/":
                return Operator.Divide;
            case "*":
                return Operator.Multiply;
        }
    }
}

export class ComparisonParser implements Parser {
    public priority: number = 1;
    private service: ParsingService;
    private isDone: boolean;
    private state: string;
    private current: ComparingNode;

    public constructor(service: ParsingService) {
        this.service = service;
    }

    public activate(word: string): boolean {
        this.isDone = false;
        this.state = "Operator";
        return Keywords.comparator(this.service.language).some(_ => _ === word);
    }

    public read(word: string): SyntaxNode {
        if (word.trim() === "") { return null; }

        switch (this.state) {
            case "Operator":
                this.current = new ComparingNode(this.getComparator(word),
                    null,
                    null);
                this.state = "Right";
                return null;
            case "Right":
                break;
        }

        const currentNode = this.service.nodes.pop();
        let assignment: AssignmentNode;

        if (!currentNode) { throw new Error(`No node found before comparison node.`); }
        if (currentNode.type === ExpandVariableNode.name) {
            const result = new ComparingNode(this.current.comparator,
                currentNode,
                this.service.clone().revert(1).parseOne());
            return result;
        } else if (currentNode.type === UnwrapSequenceNode.name) {
            const unwrap = currentNode as UnwrapSequenceNode;
            for (let i = 0; i < unwrap.children.length; i++) {
                const current = unwrap.children[i];
                if (current.type === new AssignmentNode(null, null).type) {
                    assignment = current as AssignmentNode;
                    const result = new AssignmentNode(assignment.variableName, new ComparingNode(this.current.comparator,
                        assignment.value,
                        this.service.clone().revert(1).parseOne()));
                    unwrap.children[i] = result;

                    if (loggingLevel === "verbose") {
                        console.log(`Comparator Parser result:
${JSON.stringify(unwrap, undefined, 2)}`);
                    }

                    this.isDone = true;
                    return unwrap;
                }
            }
        }

        throw new Error(`Illegal state for Comparator Parser. Can only be a part of an variable expansion. Instead is part of ${currentNode.type}`);
    }

    public done(): boolean {
        return this.isDone;
    }

    private getComparator(word: string) {
        switch (word) {
            case "<":
                return Comparator.Smaller;
            case "<=":
                return Comparator.SmallerOrEqual;
            case "=":
                return Comparator.Equal;
            case ">":
                return Comparator.Larger;
            case ">=":
                return Comparator.LargerOrEqual;
            case "<>":
                return Comparator.NotEqual;
        }
    }
}

export class ScopeParser implements Parser {
    public priority: number = 1;
    private isDone: boolean = false;
    private service: ParsingService;
    private keywords: string[];
    private scope: string[];
    private started: boolean;
    private depth: number;

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.scope(this.service.language);
        this.scope = [];
    }

    public activate(word: string): boolean {
        const activate = this.keywords.some(_ => _ === word.trim());
        this.isDone = !activate;
        this.started = false;
        this.depth = 0;
        return activate;
    }

    public read(word: string): SyntaxNode {
        word = word.trim();
        if (word === "" || !word) { return null; }
        if (this.keywords.some(_ => word.startsWith(_)) && !this.started) { return null; }
        this.started = true;

        if (this.keywords.some(_ => word.startsWith(_))) { this.depth++; }
        if (Keywords.end(this.service.language).some(_ => word.endsWith(_))) {
            if (this.depth > 0) {
                this.depth--;
            } else {
                const parser = new ParsingService(this.scope, this.service.language);
                const body = parser.parse();
                this.isDone = true;
                return body;
            }
        }

        this.scope.push(word);
        return null;
    }

    public done(): boolean {
        return this.isDone;
    }
}

export class SwitchScopeParser implements Parser {
    public priority: number = 1;
    private isDone: boolean = false;
    private service: ParsingService;
    private keywords: string[];
    private state = "";
    private current: SwitchComparisonNode;
    private comparisonNodes: SwitchComparisonNode[];

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.scope(this.service.language);
        this.state = "Scope";
        this.comparisonNodes = [];
    }

    public read(word: string): SyntaxNode {
        /**
         *  (
         *      UP (
         *              robot.position.row is our robot.position.row - 1
         *      )
         *      DOWN (
         *              robot.position.row is our robot.position.row - 1
         *      )
         *  )
         *
         * let row = new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
         *   new ExpandVariableNode(new StringNode("position")),
         *   new ExpandVariableNode(new StringNode("row")))
         * new SwitchComparisonNode(new StringNode("UP"),
         *               new UnwrapSequenceNode(new ExpandVariableNode(new StringNode("robot")),
         *               new ExpandVariableNode(new StringNode("position")),
         *               new AssignmentNode(new StringNode(variable), new OperationNode(Operator.Substract, row, new NumberNode(1)))),
         */
        word = word.trim();
        if (word === "" || !word) { return null; }
        if (loggingLevel === "verbose") { console.log(`Reading word ${word} for switch scope with state ${this.state}...`); }
        if (this.keywords.some(_ => word.trim().startsWith(_)) && this.state === "Scope") {
            this.state = "Comparer";
            return null;
        }

        switch (this.state) {
            case "Comparer":
                if (this.current) {
                    this.comparisonNodes.push(this.current);
                }

                if (Keywords.end(this.service.language).some(_ => word.trim().indexOf(_) >= 0)) {
                    break;
                }
                this.current = new SwitchComparisonNode(this.service.clone().revert(1).parseOne());
                this.state = "Body";
                return null;
            case "Body":
                this.state = "Comparer";
                try {
                    this.current = new SwitchComparisonNode(this.current.comparable,
                        this.service.clone().revert(1).parseOne());
                } catch (err) {
                    console.log(err);
                    throw err;
                }
                if (loggingLevel === "verbose") {
                    console.log(`Read a full body.
Result:
${JSON.stringify(this.current, undefined, 2)}`);
                }
                return null;
        }

        if (loggingLevel === "verbose") {
            console.log(`Think I"m done with switch scope.
Result:
${JSON.stringify(this.comparisonNodes, undefined, 2)}`);
        }

        this.isDone = true;
        return this.comparisonNodes as any;
    }

    public done(): boolean {
        return this.isDone;
    }

    public activate(word: string): boolean {
        return false;
    }
}

export class SwitchParser implements Parser {
    public priority: number = 1;
    private isDone: boolean = false;
    private service: ParsingService;
    private keywords: string[];
    private state: string;
    private comparator: SyntaxNode;
    private comparisonNodes: SwitchComparisonNode[];

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.switch(this.service.language);
    }

    public activate(word: string): boolean {
        const activate = this.keywords.some(_ => _ === word);
        this.isDone = !activate;
        this.state = "Comparer";
        this.comparisonNodes = [];
        return activate;
    }

    public read(word: string): SyntaxNode {
        /**
         *      switch direction (
         *          UP (
         *              robot.position.row is our robot.position.row - 1
         *          )
         *      )
         *      new SwitchNode(new ExpandVariableNode(new StringNode("direction")),
         *           new SwitchComparisonNode(new StringNode("UP"),
         *               positionScope("row", new OperationNode(Operator.Substract, row, new NumberNode(1)))),
         */
        if (loggingLevel === "verbose") { console.log(`Trying to read word "${word}" in state ${this.state}`); }
        if (this.keywords.some(_ => _ === word) && this.state === "Comparer") { return null; }
        if (Keywords.doNothings(this.service.language).some(_ => _ === word.trim())) { return null; }
        if (loggingLevel === "verbose") { console.log(`Reading word "${word}" in state ${this.state}`); }

        switch (this.state) {
            case "Comparer":
                if (Keywords.end(this.service.language).some(_ => word.trim().indexOf(_) >= 0)) { break; }
                this.comparator = this.service.clone().revert(1).parseOne();
                this.state = "ComparisonScope";
                return null;
            case "ComparisonScope":
                const service = this.service.clone().revert(1);
                service.setParser(new SwitchScopeParser(service));
                const result = service.parseOne();
                if (!result) { throw new Error(`Invalid switch statement. Scope not readable, or incomplete.`); }
                this.comparisonNodes.push(...result as any);
                this.service.revert(1);
                this.state = "Comparer";
                return null;
        }

        this.isDone = true;
        return new SwitchNode(this.comparator, ...this.comparisonNodes);
    }

    public done(): boolean {
        return this.isDone;
    }
}

export class DeclareFunctionParser implements Parser {
    public priority: number = 1;
    private isDone: boolean = false;
    private service: ParsingService;
    private keywords: string[];
    private state: string;
    private node: FunctionNode;
    private args: VariableNode[];
    private scopeDepth: number = 0;

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.declareFunction(this.service.language);
        this.state = "Name";
        this.args = [];
    }

    public activate(word: string): boolean {
        const activate = this.keywords.some(_ => _ === word.trim());
        this.isDone = !activate;
        return activate;
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("DeclareFunctionParser reading " + word); }
        word = word.trim();
        if (word === "") { return null; }
        if (this.keywords.some(_ => _ === word)) { return null; }
        switch (this.state) {
            case "Name":
                this.node = new FunctionNode(word, null);
                this.state = "Variables";
                return null;
            case "Variables":
                if (Keywords.declare(this.service.language).some(_ => _ === word.trim())) { return null; }
                if (Keywords.doNothings(this.service.language).some(_ => _ === word.trim())) { return null; }
                if (Keywords.scope(this.service.language).some(_ => word.trim().startsWith(_))) {
                    this.state = "Body";
                    this.service.revert(1);
                    return null;
                }

                this.args.push(new VariableNode(this.service.clone().parseWord(word)));
                return null;
            case "Body":
                if (loggingLevel === "verbose") { console.log("get scoped body"); }
                const scope = this.service.clone().revert(1).parseOne();
                if (loggingLevel === "verbose") { console.log("scope retrieved"); }
                this.node = new FunctionNode(this.node.name,
                    scope,
                    null,
                    ...this.args);
                if (loggingLevel === "verbose") { console.log(this.node); }
                this.state = "EndBody";
                break;
            case "EndBody":
                if (Keywords.scope(this.service.language).some(_ => _ === word)) {
                    this.scopeDepth++;
                    if (loggingLevel === "verbose") { console.log(`Scope Depth increased to ${this.scopeDepth}`); }
                }
                if (Keywords.end(this.service.language).some(_ => word.endsWith(_))) {
                    if (loggingLevel === "verbose") { console.log(`Scope Depth decrease - ${this.scopeDepth}`); }
                    this.scopeDepth--;
                }

                if (this.scopeDepth < 1) {
                    break;
                }
                return null;
        }

        this.isDone = true;
        return this.node;
    }

    public done(): boolean {
        return this.isDone;
    }
}

export class CallFunctionParser implements Parser {
    public priority = 1;
    private isDone: boolean = true;
    private service: ParsingService;
    private keywords: string[];
    private state: string = "Name";
    private functionName: SyntaxNode;
    private functionArguments: AssignmentNode[];
    private currentArgument: SyntaxNode = null;

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.callFunction(this.service.language);
        this.functionArguments = [];
    }

    public activate(word: string): boolean {
        const activate = this.keywords.some(_ => _ === word.trim());
        this.isDone = !activate;
        this.state = "Name";
        return activate;
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("CallFunctionParser reading " + word); }
        if (this.keywords.some(_ => _ === word.trim()) && this.state === "Name") { return null; }

        /**
         * then move
         * then move in the direction up
         * then move in the direction up in the position 2
         */
        switch (this.state) {
            case "Name":
                this.functionName = this.service.clone().parseWord(word);
                if (this.functionName === null) { throw new Error("Cannot call nameless function"); }
                this.state = "DefineVariables";
                if (this.service.words.length < 1) { break; }
                return null;
            case "DefineVariables":
                if (Keywords.doNothings(this.service.language).some(_ => _ === word.trim())) { return null; }
                if (!Keywords.declare(this.service.language).some(_ => _ === word.trim())) {
                    this.service.revert(1);
                    if (loggingLevel === "verbose") { console.log(`Quiting CallFunctionParser because word ${word} not relevant`); }
                    break;
                }
                if (this.service.words.length < 1) { break; }
                this.state = "DeclareVariables";
                return null;
            case "DeclareVariables":
                if (Keywords.doNothings(this.service.language).some(_ => _ === word.trim())) { return null; }

                this.currentArgument = this.service.clone().parseWord(word);
                this.state = "AssignVariables";
                return null;
            case "AssignVariables":
                if (Keywords.doNothings(this.service.language).some(_ => _ === word.trim())) { return null; }
                if (Keywords.assign(this.service.language).some(_ => _ === word.trim())) { return null; }
                this.functionArguments.push(
                    new AssignmentNode(this.currentArgument,
                        this.service.clone().revert(1).parseOne()));

                if (this.service.words.length < 1) { break; }
                this.state = "DefineVariables";
                return null;
        }

        this.isDone = true;
        return new CallFunctionNode(this.functionName, ...this.functionArguments);
    }

    public done(): boolean {
        return this.isDone;
    }
}

export class ClassParser implements Parser {
    public priority: number = 1;
    private isDone: boolean = true;
    private service: ParsingService;
    private keywords: string[];
    private state: string;
    private node: SyntaxNode;
    private fields: { [field: string]: any };
    private currentField: string;

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.createInstance(this.service.language);
    }

    public activate(word: string): boolean {
        const activate = this.keywords.some(_ => _ === word);
        this.isDone = !activate;
        this.state = "Type";
        if (activate && loggingLevel === "verbose") { console.log("ClassParser activated for " + word); }
        return activate;
    }

    public read(word: string): SyntaxNode {
        if (this.keywords.some(_ => _ === word) && this.state === "Type") { return null; }
        if (word.trim() === "") { return null; }
        switch (this.state) {
            case "Type":
                this.node = new ClassNode(word, {});
                this.state = "ExpectScope";
                return null;
            case "ExpectScope":
                if (word.trim() === "()") { break; }
                if (word.trim() !== "(") { throw new Error(`Starting scope expected for class ${this.node.type}. Instead received ${word}`); }
                this.state = "FieldDeclaration";
                this.fields = {};
                return null;
            case "FieldDeclaration":
                if (word.trim().indexOf(")") > -1) { break; }

                if (!Keywords.declare(this.service.language).some(_ => _ === word.trim())) {
                    throw new Error(`Field declaration in class definition expected. Instead received ${word}
Current Class:
${JSON.stringify(this.fields, undefined, 2)}
History:
${JSON.stringify(this.service.wordHistory, undefined, 2)}`);
                }
                this.state = "Field";
                return null;
            case "Field":
                this.currentField = word;
                this.fields[word] = {};
                this.state = "FieldAssignment";
                return null;
            case "FieldAssignment":
                if (!Keywords.assign(this.service.language).some(_ => _ === word.trim())) {
                    throw new Error(`Field assignment in class definition expected. Instead received ${word}
Current Class:
${JSON.stringify(this.fields, undefined, 2)}`);
                }
                this.state = "FieldBody";
                return null;
            case "FieldBody":
                if (Keywords.createInstance(this.service.language).some(_ => _ === word.trim())) {
                    this.fields[this.currentField] = this.service.clone().revert(1).parseOne();
                } else {
                    this.fields[this.currentField] = this.service.clone().revert(1).parseOne();
                }

                this.node = new ClassNode((this.node as ClassNode).dataType, this.fields);
                this.state = "FieldDeclaration";
                return null;
        }

        this.isDone = true;
        return this.node;
    }

    public done(): boolean {
        return this.isDone;
    }
}

export class AssignmentParser implements Parser {
    public priority = 1;
    private isDone: boolean = true;
    private service: ParsingService;
    private assignableService: ParsingService;
    private keywords: string[];

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.assign(this.service.language);
    }

    public activate(word: string): boolean {
        const activate = this.keywords.some(_ => _ === word);
        this.isDone = !activate;
        if (activate && loggingLevel === "verbose") { console.log("AssignmentParser activated for " + word); }
        return activate;
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("AssignmentParser reading " + word); }

        if (this.keywords.some(_ => _ === word)) { return null; }
        if (this.service.wordHistory.length < 3) { throw new Error("Variable assignment cannot be the first statement"); }

        const variableNameStatement = this.service.wordHistory[this.service.wordHistory.length - 3];
        const variableName = this.service.clone().parseWord(variableNameStatement);
        const result = this.service.clone().revert(1).parseOne();
        const unwrapAssignmentParser = new UnwrapAssignmentParser(result);
        this.isDone = true;
        if (this.service.nodes[this.service.nodes.length - 1].type !== new VariableNode(null).type) {
            // undo the storing of the variable if not declared beforoe
            this.service.dropNodes(1);
        }
        if (unwrapAssignmentParser.activate(variableNameStatement)) {
            return unwrapAssignmentParser.read(variableNameStatement);
        } else {
            if (loggingLevel === "verbose") { console.log(`AssignmentParser resulted in ${variableName}(${variableNameStatement})=${JSON.stringify(result)}`); }
            return new AssignmentNode(variableName, result);
        }
    }

    public done(): boolean {
        return this.isDone;
    }
}

export class VariableParser implements Parser {
    public priority = 1;
    private isDone: boolean = true;
    private service: ParsingService;
    private keywords: string[];

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.declare(this.service.language);
    }

    public activate(word: string): boolean {
        const activate = this.keywords.some(_ => _ === word);
        this.isDone = !activate;
        return activate;
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("VariableParser reading " + word); }
        if (this.keywords.some(_ => _ === word)) { return null; }

        const result = this.service.clone().parseWord(word);
        if (result === null) { throw new Error("Cannot create nameless variable"); }
        this.isDone = true;
        return new VariableNode(result);
    }

    public done(): boolean {
        return this.isDone;
    }
}

export class ExportParser implements Parser {

    public priority = 1;
    private isDone: boolean = true;
    private service: ParsingService;
    private keywords: string[];

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.export(this.service.language);
    }

    public activate(word: string): boolean {
        const activate = this.keywords.some(_ => _ === word);
        this.isDone = !activate;
        return activate;
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("ExportParser reading " + word); }
        if (this.keywords.some(_ => _ === word)) { return null; }

        const result = this.service.clone().revert(1).parseOne();
        if (result === null) { throw new Error("Cannot export nameless variable"); }
        this.isDone = true;
        return new ExportNode(result);
    }

    public done(): boolean {
        return this.isDone;
    }
}

export class NotifyParser implements Parser {
    public priority = 1;
    private isDone: boolean = true;
    private service: ParsingService;
    private keywords: string[];
    private state: string;
    private result: NotifyNode;

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.notify(this.service.language);
    }

    public activate(word: string): boolean {
        const activate = this.keywords.some(_ => _ === word);
        this.isDone = !activate;
        this.state = "Identifier";
        return activate;
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("NotifyParser reading " + word); }
        if (this.keywords.some(_ => _ === word)) { return null; }
        switch (this.state) {
            case "Identifier":
                this.result = new NotifyNode(this.service.clone().revert(1).parseOne(), null);
                this.state = "Event";
                return null;
            case "Event":
                this.result = new NotifyNode(this.result.identifier, this.service.clone().revert(1).parseOne());
                this.state = "";
                break;
        }

        this.isDone = true;
        return this.result;
    }

    public done(): boolean {
        return this.isDone;
    }
}

class UnwrapAssignmentParser implements Parser {
    public priority: number;
    private nodes: ExpandVariableNode[];
    private assignment: SyntaxNode;

    public constructor(result: SyntaxNode) {
        this.assignment = result;
    }

    public activate(word: string): boolean {
        const activate = word.indexOf(".") >= 0;
        this.nodes = [];
        return activate;
    }

    public read(word: string): SyntaxNode {
        const parts = word.split(".");
        const lastPart = parts.pop();
        return new UnwrapSequenceNode(...[...parts.map(_ => new ExpandVariableNode(new StringNode(_))),
        new AssignmentNode(new StringNode(lastPart), this.assignment)]);
    }

    public done(): boolean {
        return true;
    }
}

class UnwrapExpansionParser implements Parser {
    public priority: number;
    private nodes: ExpandVariableNode[];

    public activate(word: string): boolean {
        const activate = word.indexOf(".") >= 0;
        this.nodes = [];
        return activate;
    }

    public read(word: string): SyntaxNode {
        return new UnwrapSequenceNode(...word.split(".").map(_ => new ExpandVariableNode(new StringNode(_))));
    }

    public done(): boolean {
        return true;
    }
}

export class ExpandParser implements Parser {
    public priority = 1;
    private isDone: boolean = true;
    private service: ParsingService;
    private keywords: string[];

    public constructor(service: ParsingService) {
        this.service = service;
        this.keywords = Keywords.expand(this.service.language);
    }

    public activate(word: string): boolean {
        const activate = this.keywords.some(_ => _ === word);
        this.isDone = !activate;
        return activate;
    }

    public read(word: string): SyntaxNode {
        if (loggingLevel === "verbose") { console.log("ExpandParser reading " + word); }
        if (this.keywords.some(_ => _ === word)) { return null; }

        let result: SyntaxNode = null;
        const unwrapParser = new UnwrapExpansionParser();
        if (unwrapParser.activate(word)) {
            result = unwrapParser.read(word);
        } else {
            result = this.service.clone().revert(1).parseOne();
            if (result === null) { throw new Error("Cannot expand nameless variable"); }
            result = new ExpandVariableNode(result);
        }
        this.isDone = true;
        return result;
    }

    public done(): boolean {
        return this.isDone;
    }
}