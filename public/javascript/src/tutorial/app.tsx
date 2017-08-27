import * as React from "react";
import * as ReactDOM from "react-dom";
import { LevelRouter, LevelLoader } from "../game/levels";
import { Map, Tutorial } from "../game/map";
import { Page } from "./page";

interface AppState {
    tutorial: Tutorial;
}

export default class App extends React.Component<any, AppState> {
    constructor() {
        super();
        this.state = {
            tutorial: {
                pages: []
            }
        }
    }

    componentDidMount() {
        new LevelLoader().map<Map>(LevelRouter.getCurrentLevel()).then(level => {
            console.log(`loaded level ${LevelRouter.getCurrentLevel()} with following state ${JSON.stringify(level.tutorial)}`);
            this.setState({ tutorial: level.tutorial });
        });
    }

    public render() {
        return <Page elements={ 
             this.state.tutorial.pages 
        } />;
    }
}