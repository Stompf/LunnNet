import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CarGame } from './scripts/Game';

class Car extends React.Component<RouteComponentProps<any>, {}> {

    private game: CarGame;

    constructor() {
        super();
    }

    render() {
        return (
            <canvas id="CarCanvas" />
        );
    }

    componentDidMount() {
        this.game = new CarGame();
        this.game.onInit();
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.onDestroy();
        }
    }
}

export default Car;
