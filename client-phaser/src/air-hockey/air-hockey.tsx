import * as React from 'react';

import { RouteComponentProps } from 'react-router-dom';
import { BaseGame, NetworkGame } from './game';

class AirHockey extends React.Component<RouteComponentProps<any>, {}> {
    private _currentGame: BaseGame;
    private readonly CANVAS_ID = 'AirHockeyCanvas';
    private readonly NETWORK_GAME = false;

    render() {
        return (
            <div>
                <div id={this.CANVAS_ID} />
                <textarea id="AirHockeyTextarea" />
            </div>
        );
    }

    componentDidMount() {
        this._currentGame = this.NETWORK_GAME ?
            new NetworkGame(this.CANVAS_ID) :
            new BaseGame(this.CANVAS_ID);
    }

    componentWillUnmount() {
        if (this._currentGame) {
            this._currentGame.destroy();
        }
    }

}

export default AirHockey;