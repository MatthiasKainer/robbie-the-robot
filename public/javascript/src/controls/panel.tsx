import { isMobileApp } from "../game/utils/mobileApp";
declare const ace: any;
import * as React from "react";
import { Action, ActionType, Direction, Event, GameState, Map, Robot, WayOfInput } from "../models";
import HistoryList from "./history";
import DirectionControls from "./controls/directions";
import Statistics from "./statistics";
import RobotProcessor from "../game/robot/processor";
import Controllers from "./controls/controllers";

interface PanelProperties {
    actions: Action[];
    gameState: GameState;
    events: Event[];
    map: Map;
    way: WayOfInput;
    robot: Robot;
    onMove(action: Action): any;
    onRemoveStatement(index: number): any;
    onChangeStatementCount(index: number, value: number): void;
    onActionOrderingChanged(oldIndex: number, newIndex: number): void;
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
        if (this.props.way === WayOfInput.Code) {
            let editor = null;
            editor = ace.edit("editor");
            editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode("ace/mode/robbielang");
            this.setState(Object.assign(this.state, { editor }));
        }
    }

    public render() {
        console.log("Rendering Panel for map " + this.props.map.name);

        const inputControls = (this.props.way === WayOfInput.Code)
            ? <div id="editor" style={{ height: "300px" }} onChange={(e) => this.handleCodeChange(e)}></div>
            : <DirectionControls actions={this.props.map.actions} onMove={(action) => this.props.onMove(action)} />;

        const history = this.props.way === WayOfInput.Click ? <HistoryList
            events={this.props.events}
            gameState={this.props.gameState}
            onChangeStatementCount={(index, value) => this.props.onChangeStatementCount(index, value)}
            onActionOrderingChanged={(oldIndex, newIndex) => this.props.onActionOrderingChanged(oldIndex, newIndex)}
            onRemoveStatement={(index) => this.props.onRemoveStatement(index)}
            actions={this.props.actions} /> : <div />;

        return <div className="controls">
            <input type="hidden" data-test="game state" value={GameState[this.props.gameState]} />
            {this.props.gameState === GameState.STOP ? inputControls : ""}
            <Controllers map={this.props.map} robot={this.props.robot} onStart={() => this.props.onStart()} onUpdate={(action) => this.props.onUpdate(action)} state={this.props.gameState} way={this.props.way}  />
            {(this.props.gameState === GameState.LOOSE || this.props.gameState === GameState.WIN) ? <Statistics events={this.props.events} map={this.props.map} gameState={this.props.gameState} /> : ""}
            {history}
        </div>;
    }
}