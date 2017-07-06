import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AsteroidsGame } from './scripts/Game';

class Asteroids extends React.Component<RouteComponentProps<any>, {}> {

    private game: AsteroidsGame;

    constructor() {
        super();
    }

    render() {
        return (
            <canvas id="AsteroidsCanvas" />
        );
    }

    componentDidMount() {
        this.game = new AsteroidsGame();
        this.game.onInit();
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.onDestroy();
        }
    }
}

export default Asteroids;
