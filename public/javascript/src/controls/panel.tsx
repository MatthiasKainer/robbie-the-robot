declare var ace : any;
import * as React from 'react';
import { Action, ActionType, Direction, Event, GameState, Map, Robot, Way } from '../models';
import HistoryList from './history';
import DirectionControls from './directions';
import Statistics from './statistics';
import RobotProcessor from '../game/robot/processor';

interface PanelProperties {
    actions: Action[];
    gameState: GameState;
    events : Event[];
    map : Map;
    way : Way;
    robot : Robot;
    onMove(action: Action): any;
    onRemoveStatement(index: number): any;
    onUpdate(action : Action) : any;
    onStart(): any;
}


export default class Panel extends React.Component<PanelProperties, any> {
    public constructor() {
        super();
        this.state = { saved: false, code : "", editor : null };
    }

    public handleStart(event: any) {
        this.props.onStart();
    }

    handleCodeChange(event : any) {
        this.setState(Object.assign(this.state, {code: event.target.value}));
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
            this.setState(Object.assign(this.state, {editor: editor}));
        }
    }

    public render() {
        console.log("Rendering Panel for map " + this.props.map.name);

        let code_controls = <div id="editor" style={{ height: "300px" }} onChange={(e) => this.handleCodeChange(e)}></div>;

        let program_controls = this.props.way === Way.Click ? <div>
            <DirectionControls onMove={(direction) => this.handleMove(direction)} actions={this.props.map.actions} />
            <div className="play">
                <button className="btn-lg btn-primary btn-block fa fa-play" onClick={e => this.handleStart(e)}></button>
            </div>
            </div> : 
            <button className="btn-lg btn-primary btn-block fa fa-play" 
                onClick={e => {
                    /**
                     * Calling this twice is unefficient, but required to 
                     * make cheating harder - users cannot overwrite move/robot position
                     * that easy when separating execution and interpretation                    
                     */
                    new RobotProcessor(this.props.map, this.props.robot)
                        .runCode(this.state.editor.getValue(), {
                            [ActionType[ActionType.Movement]] : (_) => this.props.onUpdate(_),
                            [ActionType[ActionType.Attack]] : (_) => this.props.onUpdate(_)
                        });
                    this.props.onStart();
                    }
                }></button>;

        let restart_controls = <div>
            <button 
                className="btn-lg btn-primary btn-block fa fa-refresh" 
                onClick={(e: any) => location.reload()}>
            </button>
            <Statistics events={this.props.events} map={this.props.map} gameState={this.props.gameState} />
        </div>;

        let history = this.props.way === Way.Click ? <HistoryList 
                events={this.props.events}
                gameState={this.props.gameState}
                onRemoveStatement={(index) => this.handleRemove(index)} 
                actions={this.props.actions} /> : <div />

        return <div className="controls">
            {this.props.way === Way.Code ? code_controls : ""}
            {this.props.gameState === GameState.STOP ? program_controls : ""}
            {this.props.gameState === GameState.LOOSE ? restart_controls : ""}
            {this.props.gameState === GameState.WIN ? restart_controls : ""}
            {history}
        </div>;
    }
}