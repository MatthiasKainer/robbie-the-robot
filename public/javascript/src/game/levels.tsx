import { ApiGateway, Routes } from "../net/api";
import { GameState } from "../models";
declare const $: any;
import * as React from "react";
import { Map } from "./map";
import { Map as MapModel } from "../models";

export class LevelLoader {
    public all(): Promise<any> {
        return ApiGateway.get(new Routes.Levels());
    }

    public after(name: string): Promise<string> {
        return ApiGateway.get(new Routes.NextLevel(name));
    }

    public map<T>(name: string): Promise<T> {
        return ApiGateway.get(new Routes.Level(name));
    }
}

interface LevelSelectorState {
    maps: Map[];
}

export class LevelRouter {
    public static navigateTo(level: string) {
        window.location.href = `/levels/${level}`;
    }

    public static getCurrentLevel() {
        const currentLocation = window.location.pathname;
        if (currentLocation && currentLocation.indexOf("/levels/") >= 0) {
            const match = LevelRouter.regex.exec(currentLocation);
            if (match) {
                return match[1];
            }
        }
        if (!currentLocation || currentLocation.indexOf("/levels/") < 0) {
            return "Tutorial";
        }
    }

    private static regex = /\/levels\/(\w+)\/*/;
}

const styles = ["primary", "success", "info", "warning", "danger"];

export class LevelSelector extends React.Component<any, LevelSelectorState> {
    constructor() {
        super();
        this.state = { maps: [] };
    }

    public componentDidMount() {
        new LevelLoader().all().then(levels => {
            this.setState({ maps: levels });
        });
    }

    public render() {
        const body = this.state.maps.map((level, index) => {
            while (index >= styles.length) { index -= styles.length; }
            return <button key={level.key} className={`card card-inverse card-${styles[index]} p-3 text-center`} onClick={e => LevelRouter.navigateTo(level.key)}>
                <img className="card-img-top img-fluid" src={`/images/levels/${level.key}.png`} alt={level.name} />
                <blockquote className="card-blockquote">
                    <h3>{level.name}</h3>
                    <p>{level.description}</p>
                </blockquote>
            </button>;
        });
        return <div className="card-columns">{body}</div>;
    }
}

interface LevelForwarderProps {
    gameState: GameState;
    level: string;
}

interface LevelForwarderState {
    nextLevel?: any;
}

export class LevelForwarder extends React.Component<LevelForwarderProps, LevelForwarderState> {
    constructor() {
        super();
        this.state = {};
    }

    public componentWillMount() {
        const { gameState, level } = this.props;

        new LevelLoader().after(this.props.level)
            .then(next => {
                console.log(`[LevelForwarder] setting next level to ${next}`);
                this.setState({ nextLevel: next });
            }).catch(err => {
                console.error(`[LevelForwarder] error when trying to set next level:`);
                console.error(err);
            });
    }

    public render() {
        const { gameState, level } = this.props;
        console.log(`[LevelForwarder] State ${GameState[gameState]}, nextLevel: ${JSON.stringify(this.state.nextLevel)}`);
        if (gameState === GameState.WIN && this.state.nextLevel) {
            console.log(`[LevelForwarder] Rendering nextLevel: ${this.state.nextLevel.next}`);
            return <button className={`btn btn-success btn-block`} onClick={e => LevelRouter.navigateTo(this.state.nextLevel.next)}>
                Continue to next level &nbsp;
                <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </button>;
        }

        return null;
    }
}