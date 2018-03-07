import * as Phaser from 'phaser-ce';
import * as socketIO from 'socket.io-client';
import { Player } from './player';
import { Ball } from './ball';
import { Team, TeamSide } from './team';
// import { KeyMapping } from './key-mapping';

export class PhysicsNetworkGame {
    private readonly RECEIVE_BALL_UPDATES = true;

    protected game: Phaser.Game;
    private socket!: SocketIOClient.Socket;
    private serverIP = process.env.NODE_ENV === 'production'
        ? 'https://home.lunne.nu'
        : 'http://localhost:4444';

    private players!: Player[];
    private ball!: Ball;
    private networkGameStarted = false;
    private latestNetworkTick = 0;
    private teamLeft: Team;
    private teamRight: Team;

    private connectStatusText!: Phaser.Text;
    private scoreText!: Phaser.Text;
    private newGoalText!: Phaser.Text;

    constructor(canvasId: string) {
        this.game = new Phaser.Game(1200, 600, Phaser.AUTO, canvasId, {
            preload: this.preload,
            create: this.create,
            update: this.update
        });
        this.teamLeft = new Team(TeamSide.Left);
        this.teamRight = new Team(TeamSide.Right);
    }

    destroy() {
        this.game.destroy();

        if (this.socket) {
            this.socket.close();
        }
    }

    private preload = () => {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    };

    protected initPixi() {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };

        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.stage.backgroundColor = 0xffffff;
        this.game.renderer.view.style.border = '1px solid black';
        this.game.stage.disableVisibilityChange = true;
    }

    protected create = () => {
        this.initPixi();
        this.initTexts();

        setTimeout(() => {
            this.connect();
        }, 250);
    };

    protected update = () => {
        if (!this.socket || !this.networkGameStarted) {
            return;
        }

        this.ball.onUpdate();

        this.players.forEach(player => {
            player.onLocalUpdate(this.game);

            if (player.isLocalPlayer) {
                this.socket.emit('UpdateFromClient', player.toUpdateNetworkPlayer());
            }
        });
    };

    private drawStage() {
        const middleLine = new Phaser.Graphics(this.game);
        middleLine.beginFill(0xd3d3d3);
        middleLine.drawRect(0, 0, 5, this.game.height);
        const middleSprite = this.game.add.sprite(
            this.game.width / 2,
            0,
            middleLine.generateTexture()
        );
        middleSprite.anchor.y = 0;

        this.scoreText = this.game.add.text(
            this.game.width / 2,
            15,
            this.teamLeft.score + ' - ' + this.teamRight.score
        );
        this.newGoalText = this.game.add.text(this.game.width / 2, this.game.height / 2, 'Goal!', {
            fontSize: 100
        });
        this.newGoalText.visible = false;
    }

    private initTexts() {
        this.connectStatusText = this.game.add.text(
            this.game.world.centerX,
            this.game.world.centerY,
            'Connecting...'
        );
        this.connectStatusText.anchor.set(0.5, 0.5);
    }

    private connect() {
        this.connectStatusText.visible = true;
        this.initSocket();
    }

    private initSocket = () => {
        if (this.socket) {
            this.socket.close();
        }

        this.socket = socketIO(this.serverIP);
        this.socket.on('connect', () => {
            this.connectStatusText.setText('Connected');
            this.queue();
        });

        this.socket.on('GameFound', (data: LunnNet.PhysicsNetwork.GameFound) => {
            this.connectStatusText.setText('Game found');
            this.initNewNetworkGame(data);
        });

        this.socket.on('disconnect', () => {
            if (this.game.stage == null) {
                return;
            }

            this.game.world.removeChildren();
            this.game.physics.p2.clear();

            this.initTexts();
            this.connectStatusText.visible = true;
            this.connectStatusText.setText('Disconnected');
            this.networkGameStarted = false;
            this.connect();
        });

        this.socket.on('ServerTick', (data: LunnNet.PhysicsNetwork.ServerTick) => {
            if (this.latestNetworkTick > data.tick) {
                return;
            }

            data.players.forEach(networkPlayerUpdate => {
                const player = this.players.find(p => p.id === networkPlayerUpdate.id);
                if (player) {
                    player.onNetworkUpdate(networkPlayerUpdate);
                }
            });

            if (this.RECEIVE_BALL_UPDATES) {
                this.ball.onNetworkUpdate(data.ballUpdate);
            }

            this.latestNetworkTick = data.tick;
        });

        this.socket.on('NewGoal', (data: LunnNet.PhysicsNetwork.NewGoal) => {
            this.teamLeft.score = data.teamLeftScore;
            this.teamRight.score = data.teamRightScore;
            this.scoreText.setText(this.teamLeft.score + ' - ' + this.teamRight.score, true);
            this.newGoalText.visible = true;
            this.newGoalText.bringToTop();

            setTimeout(() => {
                this.newGoalText.visible = false;
            }, data.timeout);
        });

        // this.socket.on('BallUpdate', (data: LunnNet.PhysicsNetwork.BallUpdate) => {
        //     if (this.ballNetworkTick > data.tick) {
        //         return;
        //     }

        // });
    };

    private initNewNetworkGame(data: LunnNet.PhysicsNetwork.GameFound) {
        this.clear();
        this.connectStatusText.visible = false;
        this.game.physics.p2.world.gravity = data.physicsOptions.gravity;
        this.game.physics.p2.restitution = data.physicsOptions.restitution;
        this.game.physics.p2.world.defaultContactMaterial.friction = 0;
        this.game.width = data.gameSize.width;
        this.game.height = data.gameSize.height;

        this.drawStage();
        data.players.forEach(player => {
            this.players.push(new Player(this.game, this.socket.id === player.id, player));
        });

        this.ball = new Ball(this.game, data.ball);
        data.goals.forEach(g => this.drawGoals(g));

        this.networkGameStarted = true;
    }

    private clear() {
        this.latestNetworkTick = 0;
        this.players = [];
        this.game.world.removeChildren();
        this.game.physics.p2.clear();
        this.game.world.setBounds(0, 0, this.game.width, this.game.height);
        this.teamLeft.resetScore();
        this.teamRight.resetScore();
    }

    private drawGoals(goalOptions: LunnNet.PhysicsNetwork.GoalOptions) {
        this.drawPositionWithBox(goalOptions.top, 0xd7d7d7);
        this.drawPositionWithBox(goalOptions.back, 0xd7d7d7);
        this.drawPositionWithBox(goalOptions.bottom, 0xd7d7d7);
        this.drawPositionWithBox(goalOptions.goal, 0x000000);
    }

    private drawPositionWithBox(pBox: LunnNet.PhysicsNetwork.PositionWithBox, color: number) {
        const texture = new Phaser.Graphics(this.game);
        texture.beginFill(color);
        texture.drawRect(0, 0, pBox.width, pBox.height);
        const sprite = this.game.add.sprite(pBox.x, pBox.y, texture.generateTexture());
        this.game.physics.p2.enable(sprite);
        sprite.body.static = true;
    }

    private queue() {
        this.socket.emit('QueueMatchMaking', {
            game: 'PhysicsNetwork'
        } as LunnNet.Network.QueueMatchMaking);
        this.connectStatusText.setText('Looking for game...');
    }
}
