import * as React from 'react';
import { Action, ActionType, GameState, Goal, Map as MapModel, Position, Robot } from '../models';
import { Map } from './map';
import { setMap } from '../actions';
import { LevelLoader } from './levels';
import { GoalSprite, RobotSprite, FieldSprite, Sprite, ExplosionSprite } from './sprites';
import { WinCondition } from './conditions';
import { Tutorial } from './tutorial/intro';

interface BoardProperties {
    actions: Action[];
    robot: Robot;
    goal: Goal;
    level: string;
    gameState: GameState;
    onMapSet(map: MapModel): void;
    onWin(): void;
    onRendered() : void;
}

export default class Board extends React.Component<BoardProperties, any> {
    map: Map;

    public constructor() {
        super();
        this.state = { loadingComplete: false, initNotificationShown: false };
    }

    public win() {
        this.props.onWin();
    }

    public componentWillMount() {
        console.log(`[Board] mounting board for level ${this.props.level}...`);
        new LevelLoader().map<Map>(this.props.level).then((map) => {
            this.map = map;
            this.props.robot.position = this.map.robot;
            this.props.goal.position = this.map.goal;
            this.props.onMapSet({
                key: this.map.key,
                name: this.map.name,
                maxStars: this.map.goals.maxStars,
                goals: this.map.goals.results,
                template: this.props.level,
                size: {
                    column: this.map.columns - 1,
                    row: this.map.rows - 1
                },
                fields: this.map.fields,
                actions: map.actions ? (map.actions as any[] as string[]).map((_ : string) => ActionType[_]) : []
            });
            this.setState(Object.assign(this.state, { loadingComplete : true}));
        });
    }

    public componentDidUpdate() {
        this.state.initNotificationShown = true;
        this.props.onRendered();
    }

    public render() {
        if (!this.state.loadingComplete) return <span />;

        const { robot, goal, gameState } = this.props;
        console.log(`[Board] Rendering Board with dimensions ${this.map.rows}*${this.map.columns}`);

        let currentAction = this.props.actions && this.props.actions.length > 0 ?
            this.props.actions[0].type : ActionType.Movement;

        let sprites: Sprite[] = [
            new GoalSprite(goal.position, robot.position, gameState),
            new RobotSprite(robot.position, gameState, currentAction),
            new ExplosionSprite(robot)
        ];

        let fields = (this.map as any).fields;
        if (fields) {
            fields.forEach((field: any) => {
                sprites.push(new FieldSprite(field.sprite, field.position, field.durability));
            })
        }

        let conditions = [
            new WinCondition(goal.position, robot.position, gameState, () => this.win())
        ];

        var rows = [];
        for (var row = 0; row < this.map.rows; row++) {
            var cols = [];
            for (var col = 0; col < this.map.columns; col++) {
                let content: JSX.Element[] = [];

                sprites.some(sprite => {
                    if (sprite.isOnPosition({ row, column: col })) {
                        content.push(sprite.getElement(`${row}-${col}-${sprite.constructor.name}-${this.props.actions ? this.props.actions.length : 0}`));
                        return sprite.break();
                    }
                });

                cols.push(<div key={`${row}-${col}`} className="board-column">{content}</div>);
            }
            rows.push(<div key={`${row}`} className="board-row">{cols}</div>);
        }

        conditions.forEach(condition => {
            if (condition.isFullfilled()) condition.onFullfilled();
        });

        return <div className="board">
            {rows}
        </div>;
    }
}