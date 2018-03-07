import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { PhysicsNetworkGame } from './scripts/game';

class PhysicsNetwork extends React.Component<RouteComponentProps<any>, {}> {
    private game: PhysicsNetworkGame;

    render() {
        return <div id="PhysicsNetworkCanvas" />;
    }

    componentDidMount() {
        this.game = new PhysicsNetworkGame('PhysicsNetworkCanvas');
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }
}

export default PhysicsNetwork;
