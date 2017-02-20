import { FunctionNode } from '../../ast/availableNodes';
import { NodeProcessor } from './nodeProcessor';
import { SyntaxNode } from '../../ast/node';
import * as processors from './availableNodeProcessors';

interface Variable {
    type?: string;
    data?: any;
}

class Variables {
    private variables: { [key: string]: Variable };

    public constructor() {
        this.variables = {};
    }

    public put(name: string) {
        if (this.has(name)) throw new Error(`Variable '${name}' was already defined in this scope`);
        this.variables[name] = null;
    }

    public assign(name: string, content: any) {
        if (!this.has(name)) throw new Error(`Variable '${name}' does not exist`);
        this.variables[name] = content;
    }

    public all() {
        return this.variables;
    }

    public get(name: string) {
        if (!this.has(name)) throw new Error(`Variable '${name}' does not exist`);
        return this.variables[name] != null ? this.variables[name] : null;
    }

    public has(name: string): boolean {
        return Object.keys(this.variables).some(_ => _ === name);
    }
}

class Functions {
    private functions: { [key: string]: FunctionNode };

    public constructor() {
        this.functions = {};
    }

    public put(functionNode: FunctionNode, force?: boolean) {
        if (!force && this.has(functionNode.name))
            throw new Error(`Function '${functionNode.name}' was already defined in this scope`);
        this.functions[functionNode.name] = functionNode;
    }

    public all() {
        return this.functions;
    }

    public get(name: string) {
        if (!this.has(name)) throw new Error(`Function '${name}' does not exist`);
        return this.functions[name] || null;
    }

    public has(name: string): boolean {
        return Object.keys(this.functions).some(_ => _ === name);
    }
}

abstract class BaseScope {
    protected _variables: Variables;
    protected _functions: Functions;
    public parent: BaseScope;

    protected constructor() {
        this._variables = new Variables();
        this._functions = new Functions();
    }

    public variables() {
        let variables = new Variables();
        if (this.parent) {
            let parent = this.parent.variables();
            Object.keys(parent.all()).forEach(variable => {
                variables.put(variable);
                variables.assign(variable, parent.get(variable));
            });
        }
        Object.keys(this._variables.all()).forEach(variable => {
            if (!variables.has(variable))
                variables.put(variable);
            variables.assign(variable, this._variables.get(variable));
        });
        return variables;
    }

    public putVariable(name: string) {
        this._variables.put(name);
    }

    public getVariable(name: string) {
        return this.variables().get(name);
    }

    public assignVariable(name: string, content: any | Variable) {
        if (this._variables.has(name))
            this._variables.assign(name, content);
        else if (this.parent && this.parent.variables().has(name))
            this.parent.assignVariable(name, content);
        else {
            throw new Error(`Variable '${name}' does not exist`);
        }
    }

    private functions() {
        let functions = new Functions();
        if (this.parent) {
            let parentFunctions = this.parent.functions().all(); 
            Object.keys(parentFunctions).forEach(variable => {
                functions.put(parentFunctions[variable]);
            });
        }
        Object.keys(this._functions.all()).forEach(variable => {
            functions.put(this._functions.all()[variable], true);
        });

        return functions;
    }

    public putFunction(functionNode: FunctionNode) {
        this._functions.put(functionNode);
    }

    public getFunction(name: string) {
        return this.functions().get(name);
    }

    public abstract log(): void;
}

class Scope extends BaseScope {

    private constructor() {
        super();
    }

    public static create(outer?: Scope) {
        let scope = new Scope();
        if (outer) {
            scope.parent = outer;
        }

        return scope;
    }

    public log() {
        console.log("Variables in scope: ")
        console.log(JSON.stringify(this._variables.all()))
    }
}

class PrivateScope extends BaseScope {

    private constructor() {
        super();
    }

    public static create(outer?: Scope | PrivateScope) {
        let scope = new PrivateScope();
        if (outer) {
            scope.parent = outer;
        }

        return scope;
    }

    public log() {
        console.log("Variables in private scope: ")
        console.log(this._variables.all())
    }
}

export default class Machine {

    private nodeProcessors: NodeProcessor[];
    private scope: BaseScope;
    private subscriptions : {
        [stream : string] : ((event : any) => void)[]
    }

    public pushScope() {
        this.scope = Scope.create(this.scope as Scope);
    }

    public pushPrivateScope() {
        this.scope = PrivateScope.create(this.scope as Scope);
    }

    public popScope() {
        this.scope = this.scope.parent;
    }

    public getScope() {
        if (!this.scope) this.pushScope();
        return this.scope;
    }

    public constructor() {
        this.nodeProcessors = Object.keys(processors).map(_ => {
            return new processors[_](this) as NodeProcessor;
        });
        this.subscriptions = {};
    }

    public run(node: SyntaxNode): any {
        if (!node) return;;
        let processor = this.nodeProcessors.find(_ => _.canHandle(node));
        let result = processor ? processor.process(node) : null;
        return result;
    }

    public subscribe(stream : string, callback : (event : any) => void) {
        if (!this.subscriptions[stream]) this.subscriptions[stream] = [];
        this.subscriptions[stream].push(callback);
        return this;
    }

    public publish(stream : string, event : any) {
        if (!this.subscriptions[stream]) return;
        this.subscriptions[stream].forEach((_) => {
            _(event);
        });
        
        return this;
    }
}