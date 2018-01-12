import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AsteroidsGame } from './scripts/Game';

class Asteroids extends React.Component<RouteComponentProps<any>, {}> {

    private game: AsteroidsGame;

    render() {
        return (
            <div id="AsteroidsCanvas" />
        );
    }

    componentDidMount() {
        this.game = new AsteroidsGame('AsteroidsCanvas');
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }
}

export default Asteroids;
