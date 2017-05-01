import { FeatureToggleService } from "./toggles/features";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { Store, createStore } from "redux";
import reducers from "./reducers";
import Game from "./composition";

const store: Store<any> = createStore(reducers);

export default class App extends React.Component<any, any> {
    public render() {
        return <Provider store={store}>
            <Game />
        </Provider>;
    }
}

class ModeChooser extends React.Component<any, any> {

    public constructor() {
        super();
        this.state = { show: false };
    }

    public componentWillMount() {
        new FeatureToggleService().get("code-editor")
            .then((toggle) => {
                this.state.show = toggle ? toggle.state : false;
            });
    }

    public render() {
        return this.state.show ? <a href="/toggleEditingMode">Toggle Editing Mode</a> : null;
    }
}

ReactDOM.render(<App />, document.getElementById("game"));
ReactDOM.render(<ModeChooser />, document.querySelector("[data-nav=\"additional\"]"));