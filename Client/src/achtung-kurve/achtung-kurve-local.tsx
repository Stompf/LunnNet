import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { LocalAchtungGame } from './scripts/local-game';

export class AchtungKurveLocal extends React.Component<RouteComponentProps<any>, {}> {
    private game: LocalAchtungGame | undefined;

    render() {
        return <div id="LocalAchtungKurveGameCanvas" />;
    }

    componentDidMount() {
        this.game = new LocalAchtungGame('LocalAchtungKurveGameCanvas');
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }
}
