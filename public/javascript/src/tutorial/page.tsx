import * as React from "react";
import * as ReactDOM from "react-dom";
import Element from "./element";

export interface PageElement {
    duration: number;
    audio?: string;
    target: string;
}

interface PageProps {
    elements: PageElement[];
}

export class Page extends React.Component<PageProps, PageProps> {

    public constructor(props: PageProps) {
        super(props);
        this.state = Object.assign({}, props);
    }

    playAudio(file: string) {
        if (!file) return;
        var audio = new Audio(`/audio/en/${file}`);
        audio.play();
    }

    incrementState() {
        if (this.state.elements.length < 1) return;
        setTimeout(() => {
            const currentElement = this.state.elements.splice(0, 1)[0];
            this.setState(Object.assign({}, this.state));
            setTimeout(() => {
                this.playAudio(currentElement.audio);
            }, 500);
        }, this.state.elements[0].duration + 1000);
    }

    componentDidMount() {
        this.incrementState();
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
                bottom: 0
            }} >
                <div className="controls"></div>
                <Element target={current.target} />
            </div>;
    }
}