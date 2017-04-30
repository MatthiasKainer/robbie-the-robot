import { ExportSequenceNode, SequenceNode, StringNode } from "./availableNodes";
import { SyntaxNode } from "./node";
import * as parsers from "./availableParsers";

const loggingLevel: string = "silent";

export interface Parser {
    priority: number;
    activate(word: string): boolean;
    read(word: string): SyntaxNode;
    done(): boolean;
}

export const Keywords = {
    "declare": (language: string) => {
        if (language === "de") { return ["die", "der"]; }
        return ["the", "let"];
    },
    "assign": (language: string) => {
        if (language === "de") { return ["ist"]; }
        return ["is"];
    },
    "expand": (language: string) => {
        if (language === "de") { return ["unser", "unsere"]; }
        return ["our"];
    },
    "createInstance": (language: string) => {
        if (language === "de") { return ["ein", "eine"]; }
        return ["a", "an"];
    },
    "doNothings": (language: string) => {
        if (language === "de") { return ["in"]; }
        return ["in"];
    },
    "export": (language: string) => {
        if (language === "de") { return ["zurück", "gib", "exportiere", "sag"]; }
        return ["export", "return", "say"];
    },
    "scope": (language: string) => {
        return ["("];
    },
    "end": (language: string) => {
        return [")"];
    },
    "callFunction": (language: string) => {
        if (language === "de") { return ["mache", "dann"]; }
        return ["call", "execute", "then"];
    },
    "declareFunction": (language: string) => {
        if (language === "de") { return ["wenn"]; }
        return ["when"];
    },
    "switch": (language: string) => {
        if (language === "de") { return ["falls"]; }
        return ["case", "switch", "if"];
    },
    "operation": (language: string) => {
        return ["+", "-", "/", "*"];
    },
    "comparator": (language: string) => {
        return ["=", "<>", ">", "<", ">=", "<="];
    },
    "loop": (language: string) => {
        if (language === "de") { return ["solange"]; }
        return ["for", "while"];
    },
    "combine": (language: string) => {
        return ["&"];
    },
    "notify": (language: string) => {
        if (language === "de") { return ["benachrichtige"]; }
        return ["notify", "publish"];
    },
};

export interface Word {
    dirty: string;
    value: string;
}

export class WordService {
    public static create(code: string) {
        if (loggingLevel === "verbose") { console.log("Creating word list from: " + code); }
        return code.trim().split(" ");
    }
}

const position = (wordHistory: string[]) => {
    const history = [...wordHistory].reverse();
    class Result {
        public line: number;
        public char: number;

        constructor(line: number, char: number) {
            this.line = line;
            this.char = char;
        }

        public toString() {
            return `Line: ${this.line} Char: ${this.char}`;
        }
    }

    let line = 0;
    let char = 0;
    history.forEach(_ => {
        if (_.indexOf("\n") > -1) {
            line += (_.match(/\n/g) || []).length;
            char = _.length - _.lastIndexOf("\n");
        } else {
            char += _.length + 1;
        }
    });

    return new Result(line, char);
};

export class ParsingService {
    private language: string;
    private parsers: Parser[];
    private words: string[];
    private wordHistory: string[] = [];
    private currentParser: Parser = null;
    private nodes: SyntaxNode[] = [];

    public constructor(words: string[], language = "en", wordHistory: string[] = []) {
        this.words = words;
        this.language = language;
        this.parsers = Object.keys(parsers).map(_ => {
            return new parsers[_](this) as Parser;
        }).sort((a, b) => a.priority - b.priority);
        this.wordHistory = wordHistory;
        if (loggingLevel === "verbose") { console.log(`ParserService created with ${JSON.stringify(words)} and history ${JSON.stringify(wordHistory)}`); }
    }

    public clone() {
        return new ParsingService(this.words, this.language, this.wordHistory);
    }

    public setParser(parser: Parser) {
        this.currentParser = parser;
        return this;
    }

    public revert(words: number) {
        for (let i = words; i > 0 && this.wordHistory.length > 0; i--) {
            this.words.unshift(this.wordHistory.pop());
        }
        return this;
    }

    public dropNodes(nodes: number) {
        for (let i = nodes; i > 0 && this.nodes.length > 0; i--) {
            this.nodes.pop();
        }
        return this;
    }

    public parseWord(word: string) {
        if (loggingLevel === "verbose") { console.log(`ParserService: Current word: ${word}`); }
        if (!this.currentParser) { this.currentParser = this.getParsers().find(_ => _.activate(word)); }
        if (!this.currentParser) { throw new Error(`The word "${word}" cannot be resolved to anything`); }
        return this.decorateIfException(() => this.currentParser.read(word));
    }

    public parse() {
        while (this.words.length > 0) {
            const word = this.getNextWord();

            this.wordHistory.push(word);
            try {
                const node = this.parseWord(word);
                if (node) {
                    this.nodes.push(node);
                }
            } catch (err) {
                throw new Error(`Error parsing word ${word} while working with ${this.currentParser.constructor.name}.
${JSON.stringify(this.nodes, undefined, 2)}

Words remaining:
${JSON.stringify(this.words)}

History:
${JSON.stringify(this.wordHistory)}

Inner exception: ${err.message}
${err.stack}`);
            }

            if (this.currentParser.done()) { this.currentParser = null; }
        }
        if (this.currentParser !== null && !this.currentParser.done()) {
            if (loggingLevel === "verbose") { console.log(this.currentParser); }
            throw new Error(`Incomplete code while working with ${this.currentParser.constructor.name}. What I understood soo far:
${JSON.stringify(this.nodes, undefined, 2)}

Words remaining:
${JSON.stringify(this.words)}

History:
${JSON.stringify(this.wordHistory)}`);
        }

        if (loggingLevel === "verbose") { console.log(`Result:\n${JSON.stringify(this.nodes, undefined, 2)}`); }
        if (this.nodes.length < 1) { return null; }
        if (this.nodes.length === 1) { return this.nodes[0]; }
        return new ExportSequenceNode(...this.nodes);
    }

    public parseUntil(words: string[]) {
        while (this.words.length > 0) {
            const word = this.getNextWord();
            this.wordHistory.push(word);
            if (words.some(_ => _ === word)) {
                this.currentParser = null;
                break;
            }
            const node = this.parseWord(word);
            if (node) {
                this.nodes.push(node);
            }

            if (this.currentParser.done()) { this.currentParser = null; }
        }

        if (this.currentParser !== null && !this.currentParser.done()) {
            if (loggingLevel === "verbose") { console.log(this.currentParser); }
            throw new Error(`Incomplete code while working with ${this.currentParser.constructor.name}. What I understood soo far:
${JSON.stringify(this.nodes, undefined, 2)}

Words remaining:
${JSON.stringify(this.words)}

History:
${JSON.stringify(this.wordHistory)}`);
        }

        if (loggingLevel === "verbose") { console.log(`Result:\n${JSON.stringify(this.nodes, undefined, 2)}`); }
        if (this.nodes.length < 1) { return null; }
        if (this.nodes.length === 1) { return this.nodes[0]; }
        return new ExportSequenceNode(...this.nodes);
    }

    public parseOne() {
        const nodes: SyntaxNode[] = [];
        while (this.words.length > 0) {
            const word = this.getNextWord();
            this.wordHistory.push(word);
            const node = this.parseWord(word);
            if (node) {
                nodes.push(node);
            }

            if (this.currentParser.done()) { break; }
        }
        if (this.currentParser !== null && !this.currentParser.done()) {
            throw new Error(`Incomplete code while working with ${this.currentParser.constructor.name}. What I understood soo far:
${JSON.stringify(this.nodes, undefined, 2)}

Words remaining:
${JSON.stringify(this.words)}

History:
${JSON.stringify(this.wordHistory)}`);
        }

        if (loggingLevel === "verbose") { console.log(`Result:\n${JSON.stringify(nodes, undefined, 2)}`); }
        if (nodes.length < 1) { return null; }
        if (nodes.length === 1) { return nodes[0]; }
        return new ExportSequenceNode(...nodes);
    }

    private getParsers() {
        return Object.keys(parsers).map(_ => {
            return new parsers[_](this) as Parser;
        }).sort((a, b) => a.priority - b.priority);
    }

    private decorateIfException(fun: () => void): any {
        try {
            return fun();
        } catch (err) {
            if (!err.stack || err.stack.indexOf("decorateIfException") === err.stack.lastIndexOf("decorateIfException")) {
                throw new Error(`[${position(this.wordHistory).toString()}] -> ${err.message || err}

Stack: ${err.stack}`);
            } else {
                throw err;
            }
        }
    }

    private splitWord(word: string, character: string) {
        if (word.indexOf(character) >= 0 && word.length !== 1) {
            const parts = word.split(character);
            word = parts.shift();
            parts.reverse().forEach(_ => {
                this.words.unshift(_);
                this.words.unshift(character);
            });
        }
        return word;
    }

    private getNextWord() {
        let word = this.words.shift();
        // split newlines
        word = this.splitWord(word, "\n");
        // split scopes
        word = this.splitWord(word, "(");
        word = this.splitWord(word, ")");
        // split operators
        Keywords.operation(this.language).forEach(_ => {
            word = this.splitWord(word, _);
        });
        Keywords.comparator(this.language).forEach(_ => {
            word = this.splitWord(word, _);
        });
        Keywords.combine(this.language).forEach(_ => {
            word = this.splitWord(word, _);
        });

        return word;
    }
}