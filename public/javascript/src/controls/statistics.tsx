import * as React from "react";
import * as Actions from "../actions";
import { ActionType, Event, GameState, Map, Stars } from "../models";

interface StatisticsProperties {
    map: Map;
    gameState: GameState;
    events: Event[];
}

class MoveStatistics extends React.Component<StatisticsProperties, any> {
    public render() {
        const { events, map } = this.props;
        const actions = events.filter(event => event.name === Actions.PERFORM_ACTION && event.body.type !== ActionType.End).length;
        const runs = events.filter(event => event.name === Actions.START).length;

        const result = map.goals.find(_ => {
            return actions <= _.moves && runs <= _.runs;
        }) || { moves: actions, runs, stars: Stars.ONE };

        const stars = [];
        for (let i = 0; i <= result.stars; i++) {
            stars.push(<i key={`achieved-stars-rating-${i}`} className="fa fa-star" aria-hidden="true"></i>);
        }
        for (let i = result.stars; i < map.maxStars; i++) {
            stars.push(<i key={`unachieved-stars-rating-${i}`} className="fa fa-star-o" aria-hidden="true"></i>);
        }

        const starStyle = { fontSize: "6rem", color: "gold" };
        return <div className="card text-center">
            <div className="card-header">
                <h3>You won!</h3>
                <div style={starStyle}>
                    {stars}
                </div>
            </div>
            <div className="card-block">
                <h4 className="card-title">{`You have received ${result.stars + 1} stars out of ${map.maxStars + 1} stars possible`}</h4>
                <div className="card-text">
                    <ul className="list-group">
                        <li className="list-group-item justify-content-between">
                            Actions: <span className="badge badge-default badge-pill">{actions}</span>
                        </li>
                        <li className="list-group-item justify-content-between">
                            Runs: <span className="badge badge-default badge-pill">{runs}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>;
    }
}

export default class Statistics extends React.Component<StatisticsProperties, any> {
    public render() {
        const { gameState, events } = this.props;
        if (gameState !== GameState.WIN) {
            return <div />;
        }

        return <MoveStatistics
            events={this.props.events}
            map={this.props.map}
            gameState={this.props.gameState} />;
    }
}