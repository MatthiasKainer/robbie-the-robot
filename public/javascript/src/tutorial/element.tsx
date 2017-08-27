import * as React from "react";
import * as ReactDOM from "react-dom";

interface ElementProps {
    target: string;
}

interface OverlayState {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface ElementState {
    elements: OverlayState[];
}

class Overlay extends React.Component<OverlayState> {

    public render() {
        return <div style={Object.assign({
            position: "absolute",
            background: "white",
            opacity: 1
        }, this.props)}></div>;
    }
}

export default class Element extends React.Component<ElementProps, ElementState> {

    interval: any;

    public constructor(props: ElementProps) {
        super(props);
        this.state = {
            elements: []
        };
    }

    private lock() {
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            const elements = [...document.querySelectorAll(this.props.target)];
            this.setState({
                elements: elements.map(element => {
                    if (!this.props.target || !element) return;
                    const { top, left, width, height } = element.getBoundingClientRect();
                    return { top, left, width, height };
                })
            });
        }, 500);
    }

    componentDidMount() {
        this.lock();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    public render() {
        return <div>{this.state.elements.map(_ => <Overlay top={_.top} left={_.left} width={_.width} height={_.height} />)}</div>;
    }
}