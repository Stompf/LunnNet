import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { NetworkAchtungGame } from './scripts/network-game';

export class AchtungKurveNetwork extends React.Component<RouteComponentProps<any>, {}> {
    private game: NetworkAchtungGame | undefined;

    render() {
        return <div id="NetworkAchtungKurveGameCanvas" />;
    }

    componentDidMount() {
        this.game = new NetworkAchtungGame('NetworkAchtungKurveGameCanvas');
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }
}
