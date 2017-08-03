import * as React from 'react';
import { Player } from './player';
import { RouteComponentProps } from 'react-router-dom';
import { KeyMapping } from './key-mapping';
import * as Phaser from 'phaser-ce';
import { Ball } from './ball';

class AirHockey extends React.Component<RouteComponentProps<any>, {}> {
    private game: Phaser.Game;
    private readonly canvasId = 'AirHockeyCanvas';

    private player1: Player;
    private player2: Player;
    private ball: Ball;

    constructor() {
        super();
    }

    render() {
        return (
            <div>
                <div id={this.canvasId} />
                <textarea id="AirHockeyTextarea" />
            </div>
        );
    }

    componentDidMount() {
        this.game = new Phaser.Game(1400, 600, Phaser.AUTO, this.canvasId, { preload: this.preload, create: this.create, update: this.update });
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy();
        }
    }

    private preload = () => {
        // Assets
    }

    private create = () => {
        this.game.stage.backgroundColor = 0xFFFFFF;
        this.game.renderer.view.style.border = '1px solid black';
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.world.gravity = [0, 0];
        this.game.physics.p2.restitution = 0.8;

        this.player1 = new Player(this.game, KeyMapping.Player1_Mapping, 0xFF0000, 0);
        this.player2 = new Player(this.game, KeyMapping.Player2_Mapping, 0x0000FF, 1);
        this.player1.setPosition(new Phaser.Point(this.game.width / 4, this.game.height / 2));
        this.player2.setPosition(new Phaser.Point(this.game.width / 1.25 - this.player2.RECT_SIZE, this.game.height / 2));

        this.ball = new Ball(this.game);
        this.ball.setPosition(new Phaser.Point(this.game.width / 2, this.game.height / 2));
    }

    private update = () => {
        this.player1.onUpdate(this.game);
        this.player2.onUpdate(this.game);
    }
}

export default AirHockey;