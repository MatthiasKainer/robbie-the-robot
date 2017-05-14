import { isMobileApp } from "../game/utils/mobileApp";
declare const ace: any;
import * as React from "react";
import { Action, ActionType, Direction, Event, GameState, Map, Robot, Way } from "../models";
import HistoryList from "./history";
import DirectionControls from "./directions";
import Statistics from "./statistics";
import RobotProcessor from "../game/robot/processor";

interface PanelProperties {
    actions: Action[];
    gameState: GameState;
    events: Event[];
    map: Map;
    way: Way;
    robot: Robot;
    onMove(action: Action): any;
    onRemoveStatement(index: number): any;
    onChangeStatementCount(index: number, value: number): void;
    onUpdate(action: Action): any;
    onStart(): any;
}

export default class Panel extends React.Component<PanelProperties, any> {
    public constructor() {
        super();
        this.state = { saved: false, code: "", editor: null };
    }

    public handleStart(event: any) {
        this.props.onStart();
    }

    public handleCodeChange(event: any) {
        this.setState(Object.assign(this.state, { code: event.target.value }));
    }

    public handleMove(movement: Action) {
        this.props.onMove(movement);
    }

    public handleRemove(index: number) {
        this.props.onRemoveStatement(index);
    }

    public handleRequestClose() {
        this.setState({ saved: false });
    }

    public componentDidMount() {
        if (this.props.way === Way.Code) {
            let editor = null;
            editor = ace.edit("editor");
            editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode("ace/mode/robbielang");
            this.setState(Object.assign(this.state, { editor }));
        }
    }

    public render() {
        console.log("Rendering Panel for map " + this.props.map.name);

        const codeControls = <div id="editor" style={{ height: "300px" }} onChange={(e) => this.handleCodeChange(e)}></div>;

        const programControls = this.props.way === Way.Click ? <div>
            <DirectionControls onMove={(direction) => this.handleMove(direction)} actions={this.props.map.actions} />
            <div className="play">
                <button data-test="run program" className="btn btn-primary btn-block fa fa-play" onClick={e => this.handleStart(e)}></button>
            </div>
        </div> :
            <button data-test="run program" className="btn btn-primary btn-block fa fa-play"
                onClick={e => {
                    /**
                     * Calling this twice is unefficient, but required to
                     * make cheating harder - users cannot overwrite move/robot position
                     * that easy (i.e. by `robot.position.row is 5`) when separating execution and interpretation
                     */
                    new RobotProcessor(this.props.map, this.props.robot)
                        .runCode(this.state.editor.getValue(), {
                            [ActionType[ActionType.Movement]]: (_) => this.props.onUpdate(_),
                            [ActionType[ActionType.Dig]]: (_) => this.props.onUpdate(_),
                        });
                    this.props.onStart();
                }
                }></button>;

        const restartControls = <div>
            <button
                className="btn-lg btn-primary btn-block fa fa-refresh"
                onClick={(e: any) => location.reload()}>
            </button>
            <Statistics events={this.props.events} map={this.props.map} gameState={this.props.gameState} />
        </div>;

        const history = this.props.way === Way.Click ? <HistoryList
            events={this.props.events}
            gameState={this.props.gameState}
            onChangeStatementCount={(index, value) => this.props.onChangeStatementCount(index, value)}
            onRemoveStatement={(index) => this.props.onRemoveStatement(index)}
            actions={this.props.actions} /> : <div />;

        const backToLevels = <div>
            <button
                className="btn-sm btn-info btn-block"
                onClick={(e: any) => location.replace("/levels")}>
                Back to level overview
            </button>
        </div>;

        return <div className="controls">
            <input type="hidden" data-test="game state" value={GameState[this.props.gameState]} />
            {isMobileApp() ? backToLevels : ""}
            {this.props.way === Way.Code ? codeControls : ""}
            {this.props.gameState === GameState.STOP ? programControls : ""}
            {this.props.gameState === GameState.LOOSE ? restartControls : ""}
            {this.props.gameState === GameState.WIN ? restartControls : ""}
            {history}
        </div>;
    }
}