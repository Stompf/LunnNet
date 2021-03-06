import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AsteroidsGame } from './scripts/game';

class Asteroids extends React.Component<RouteComponentProps<any>, {}> {
    private game: AsteroidsGame | undefined;

    render() {
        return <div id="AsteroidsCanvas" />;
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
