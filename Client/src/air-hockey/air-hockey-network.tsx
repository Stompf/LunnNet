import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AirHockeyGame } from './scripts/game';

interface AirHockeyProps extends RouteComponentProps<any> {}

class AirHockeyNetwork extends React.Component<AirHockeyProps> {
    private game!: AirHockeyGame;

    render() {
        return <div id="AirHockeyCanvas" />;
    }

    componentDidMount() {
        this.game = new AirHockeyGame('AirHockeyCanvas');
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }
}

export default AirHockeyNetwork;
