import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { LocalAirHockeyGame } from './scripts/localGame';

interface AirHockeyProps extends RouteComponentProps<any> {}

class AirHockeyLocal extends React.Component<AirHockeyProps> {
    private game: LocalAirHockeyGame | undefined;

    render() {
        return <div id="AirHockeyCanvas" />;
    }

    componentDidMount() {
        this.game = new LocalAirHockeyGame('AirHockeyCanvas');
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }
}

export default AirHockeyLocal;
