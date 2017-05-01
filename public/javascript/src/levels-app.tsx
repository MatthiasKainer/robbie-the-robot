import { LevelSelector } from "./game/levels";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { prepareIfApp } from "./game/utils/mobileApp";

export default class App extends React.Component<any, any> {
    public render() {
        return <LevelSelector />;
    }
}

ReactDOM.render(<App />, document.getElementById("levels"));
prepareIfApp();