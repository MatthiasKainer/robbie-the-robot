import { LevelSelector } from './game/levels';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export default class App extends React.Component<any, any> {
    public render() {
        return <LevelSelector />;
    }
}

ReactDOM.render(<App />, document.getElementById("levels"));