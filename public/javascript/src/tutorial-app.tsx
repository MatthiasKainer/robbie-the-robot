import { Tutorial } from "./game/tutorial/intro";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { prepareIfApp } from "./game/utils/mobileApp";

export default class App extends React.Component<any, any> {
    public render() {
        return <Tutorial />;
    }
}

ReactDOM.render(<App />, document.getElementById("tutorial"));
prepareIfApp();