import * as React from 'react';

import { RouteComponentProps } from 'react-router-dom';
import { BaseGame } from './scripts/game';

class AirHockey extends React.Component<RouteComponentProps<any>, {}> {
    private _currentGame!: BaseGame;
    private readonly CANVAS_ID = 'AirHockeyCanvas';

    render() {
        return (
            <div>
                <div id={this.CANVAS_ID} />
                <textarea id="AirHockeyTextarea" />
            </div>
        );
    }

    componentDidMount() {
        this._currentGame = new BaseGame(this.CANVAS_ID);
    }

    componentWillUnmount() {
        if (this._currentGame) {
            this._currentGame.destroy();
        }
    }
}

export default AirHockey;
