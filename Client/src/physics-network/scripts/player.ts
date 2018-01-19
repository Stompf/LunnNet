import * as Phaser from 'phaser-ce';

export class Player {

    id: string;
    sprite: Phaser.Sprite;

    // private isLocalPlayer: boolean;

    constructor(game: Phaser.Game, _isLocalPlayer: boolean, options: LunnNet.PhysicsNetwork.NewNetworkPlayer) {
        this.id = options.id;
        this.sprite = this.createSprite(game, options);
    }

    private createSprite(game: Phaser.Game, options: LunnNet.PhysicsNetwork.NewNetworkPlayer) {
        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(options.color);
        graphics.drawCircle(0, 0, options.diameter);

        const sprite = game.add.sprite(options.position.x, options.position.y, graphics.generateTexture());
        game.physics.p2.enable(sprite);
        sprite.body.addShape(options.body.shapes[0]);

        return sprite;
    }
}