import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AirHockeyGame } from './scripts/game';
import { LocalAirHockeyGame } from './scripts/localGame';

interface AirHockeyState {
    showMainMenu: boolean;
}

interface AirHockeyProps extends RouteComponentProps<any> {}

class AirHockey extends React.Component<AirHockeyProps, AirHockeyState> {
    private game!: AirHockeyGame | LocalAirHockeyGame;

    constructor(props: AirHockeyProps) {
        super(props);
        this.state = {
            showMainMenu: true
        };
    }

    render() {
        return this.state.showMainMenu ? this.renderMainMenu() : <div id="AirHockeyCanvas" />;
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }

    private renderMainMenu() {
        return (
            <div>
                <button onClick={this.onLocalPlayClick}>Local play</button>
                <button onClick={this.onNetworkPlayClick}>Network play</button>
            </div>
        );
    }

    private onLocalPlayClick = () => {
        this.setState({ showMainMenu: false }, () => {
            this.game = new LocalAirHockeyGame('AirHockeyCanvas');
        });
    };

    private onNetworkPlayClick = () => {
        this.setState({ showMainMenu: false }, () => {
            this.game = new AirHockeyGame('AirHockeyCanvas');
        });
    };
}

export default AirHockey;
