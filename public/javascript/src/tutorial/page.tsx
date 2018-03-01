import * as React from "react";
import * as ReactDOM from "react-dom";
import Element from "./element";

export interface Actions {
    click?: string;
}

export interface PageElement {
    duration: number;
    audio?: string;
    target: string;
    actions?: Actions;
}

interface PageProps {
    elements: PageElement[];
}

export class Page extends React.Component<PageProps, PageProps> {
    timeouts: NodeJS.Timer[];
    audio: HTMLAudioElement;

    public constructor(props: PageProps) {
        super(props);
        this.timeouts = [];
        this.state = Object.assign({}, props);
    }

    playAudio(file: string) {
        if (!file) return;
        try {
            this.audio = new Audio(`/audio/en/${file}`);
            this.audio.play();
        } catch (e) {
            console.log("[Tutorial] Could not play audio. Hopefully people get the idea from the overlays.")
        }
    }

    incrementState() {
        console.log(`[Tutorial/Page] incrementing state for ${this.state.elements.length} elements`);
        if (this.state.elements.length < 1) return;
        const currentElement = this.state.elements[0];
        this.timeouts.push(setTimeout(() => {
            this.playAudio(currentElement.audio);
        }, 500));
        this.timeouts.push(setTimeout(() => {
            if (currentElement.actions) {
                if (currentElement.actions.click) {
                    if (Array.isArray(currentElement.actions.click)) {
                        currentElement.actions.click
                            .forEach(_ => [...document.querySelectorAll(_)]
                                .forEach((element: any) => element.click()));
                    }
                    else {
                        [...document.querySelectorAll(currentElement.actions.click)].forEach((element: any) => element.click());
                    }
                }
            }
        }, 500));
        this.timeouts.push(setTimeout(() => {
            this.state.elements.splice(0, 1)[0];
            console.log(`[Tutorial/Page] Applying ${JSON.stringify(currentElement)}`);
            this.setState(Object.assign({}, this.state));
        }, this.state.elements[0].duration + 1000));
    }

    checkIfAbort(event: KeyboardEvent) {
        if (event.keyCode === 27) {
            this.setState(Object.assign({}, { elements: [] }));
            if (this.audio) {
                this.audio.pause();
                this.audio.remove();
            }
        }
    }

    componentWillReceiveProps(nextProps: PageProps) {
        this.setState(nextProps);
    }

    componentDidMount() {
        this.incrementState();
        document.addEventListener("keydown", (e) => this.checkIfAbort(e), false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", (e : any) => this.checkIfAbort(e), false);
    }

    componentDidUpdate() {
        this.incrementState();
    }

    public render() {
        const current = this.state.elements[0];
        return this.state.elements.length < 1
            ? null :
            <div data-test="tutorial-page" style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "black",
                opacity: 0.5,
                zIndex: 10000
            }} >
                <div className="controls"></div>
                <Element target={current.target} />
            </div>;
    }
}