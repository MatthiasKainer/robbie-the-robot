declare const $: any;
import * as React from "react";
import { GameState } from "../models";
import { Modal } from "./utils/modal";

interface NotificationProperties {
    gameState: GameState;
}

class Win extends React.Component<any, any> {
    public render() {
        return <Modal header="You won!" className={this.props.className}>
            <div data-test="win notification" className="sprite loop big goal success"></div>
        </Modal>;
    }
}

class Loose extends React.Component<any, any> {
    public render() {
        return <Modal header="You lost!" className={this.props.className}>
            <div data-test="loose notification" className="sprite once big robot die"></div>
        </Modal>;
    }
}

export default class Notification extends React.Component<NotificationProperties, any> {
    public componentDidUpdate() {
        $(".notification").modal("show");
    }

    public render() {
        const { gameState } = this.props;
        let result = <span />;
        switch (gameState) {
            case GameState.WIN:
                console.log("[Notification] showing win notification!");
                result = <Win className="notification" />;
                break;
            case GameState.LOOSE:
                console.log("[Notification] showing loosing notification!");
                result = <Loose className="notification" />;
                break;
        }

        return <div>
            {result}
        </div>;
    }
}