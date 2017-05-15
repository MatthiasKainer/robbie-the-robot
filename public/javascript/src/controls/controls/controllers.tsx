import { isMobileApp } from "../../game/utils/mobileApp";
import RobotProcessor from "../../game/robot/processor";
import { Action, ActionType, GameState, Map, Robot, WayOfInput } from "../../models";
import * as React from "react";

interface ControllersProperties {
    state: GameState;
    map: Map;
    robot: Robot;
    way: WayOfInput;
    onUpdate(action: Action): any;
    onStart(): any;
}

export default class Controllers extends React.Component<ControllersProperties, any> {
    public render() {
        let controls: JSX.Element = null;
        switch (this.props.state) {
            case GameState.STOP:
                controls = this.props.way === WayOfInput.Click
                    ? <ClickControllers map={this.props.map} robot={this.props.robot} onStart={() => this.props.onStart()} onUpdate={(action) => this.props.onUpdate(action)} state={this.props.state} way={this.props.way} />
                    : <CodeControllers map={this.props.map} robot={this.props.robot} onStart={() => this.props.onStart()} onUpdate={(action) => this.props.onUpdate(action)} state={this.props.state} way={this.props.way} />;
                break;
            case GameState.LOOSE:
            case GameState.WIN:
                controls = <RestartController map={this.props.map} robot={this.props.robot} onStart={() => this.props.onStart()} onUpdate={(action) => this.props.onUpdate(action)} state={this.props.state} way={this.props.way} />;
        }
        return controls;
    }
}

class RestartController extends React.Component<ControllersProperties, any> {
    public render() {

        const backToLevels = <div>
            <button
                className="btn-sm btn-info btn-block"
                onClick={(e: any) => location.replace("/levels")}>
                Back to level overview
            </button>
        </div>;

        return <div>
            {isMobileApp() ? backToLevels : ""}
            <button
                className="btn-lg btn-primary btn-block fa fa-refresh"
                onClick={(e: any) => location.reload()}>
            </button>
        </div>;
    }
}

class RunControllers extends React.Component<ControllersProperties, any> {
    public onRun(): void {
        if (this.props.way === WayOfInput.Click) {
            this.props.onStart();
        } else {
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
    }

    public render() {
        const play = <button data-test="run program" className="btn btn-primary btn-block fa fa-play"
            onClick={(e) => this.onRun()} />;
        return play;
    }
}

class ClickControllers extends RunControllers {
    public onRun(): void {
        this.props.onStart();
    }
}

class CodeControllers extends RunControllers {
    public onRun(): void {
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
}