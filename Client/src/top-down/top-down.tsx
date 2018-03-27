import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { TopDownGame } from './scripts/game';

class Asteroids extends React.Component<RouteComponentProps<any>, {}> {
    private game!: TopDownGame;

    render() {
        return <div id="TopDownGameCanvas" />;
    }

    componentDidMount() {
        this.game = new TopDownGame('TopDownGameCanvas');
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }
}

export default Asteroids;
