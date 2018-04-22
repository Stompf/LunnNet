import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AchtungGame } from './scripts/game';

class AchtungKurve extends React.Component<RouteComponentProps<any>, {}> {
    private game: AchtungGame | undefined;

    render() {
        return <div id="AchtungKurveGameCanvas" />;
    }

    componentDidMount() {
        this.game = new AchtungGame('AchtungKurveGameCanvas');
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }
}

export default AchtungKurve;
