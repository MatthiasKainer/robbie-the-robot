import * as React from "react";
import * as ReactDOM from "react-dom";

interface ElementProps {
    target: string;
}

interface ElementState {
    top: number;
    left: number;
    width: number;
    height: number;
}

export default class Element extends React.Component<ElementProps, ElementState> {

    public constructor() {
        super();
        this.state = {
            top: 0,
            left: 0,
            width: 0,
            height: 0
        };
    }

    public render() {
        return <div style={Object.assign({ 
            position: "absolute", 
            background: "white", 
            opacity:1 
        }, this.state)}></div>;
    }
}