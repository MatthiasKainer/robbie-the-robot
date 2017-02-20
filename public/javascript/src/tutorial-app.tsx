import { Tutorial } from './game/tutorial/intro';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
export default class App extends React.Component<any, any> {
    public render() {
        return <Tutorial />;
    }
}

ReactDOM.render(<App />, document.getElementById("tutorial"));