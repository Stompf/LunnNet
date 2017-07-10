import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AirHockeyGame } from './scripts/Game';

import './AirHockey.css';

class AirHockey extends React.Component<RouteComponentProps<any>, {}> {

    private game: AirHockeyGame;

    constructor() {
        super();
    }

    render() {
        return (
            <div>
                <canvas id="AirHockeyCanvas" />
                <textarea id="AirHockeyTextarea" />
            </div>
        );
    }

    componentDidMount() {
        this.game = new AirHockeyGame();
        this.game.onInit();
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.onDestroy();
        }
    }
}

export default AirHockey;
