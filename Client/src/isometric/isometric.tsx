import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IsometricGame } from './scripts/game';

class Isometric extends React.Component<RouteComponentProps<any>, {}> {
    private game: IsometricGame | undefined;

    render() {
        return <div id="IsometricGameCanvas" />;
    }

    componentDidMount() {
        this.game = new IsometricGame('IsometricGameCanvas');
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }
}

export default Isometric;
