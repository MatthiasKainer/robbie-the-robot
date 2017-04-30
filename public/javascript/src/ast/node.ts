export enum Operator {
    Add,
    Substract,
    Multiply,
    Divide,
}

export enum Comparator {
    Equal,
    NotEqual,
    Larger,
    Smaller,
    LargerOrEqual,
    SmallerOrEqual,
}

export interface SyntaxNode {
    type: string;
    parent: SyntaxNode;
}