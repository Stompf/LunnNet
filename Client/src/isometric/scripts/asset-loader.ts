const BASE_ASSET_DIR = process.env.PUBLIC_URL + '/assets/games/isometric';

export enum AssetName {
    steel_armor = 'steel_armor',
    male_head1 = 'male_head1',
    greatsword = 'greatsword'
}

export const AssetLoader = {
    load(game: Phaser.Game) {
        loadSpritesheetAsset(game, AssetName.steel_armor, 'character/male/steel_armor.png');
        loadSpritesheetAsset(game, AssetName.male_head1, 'character/male/male_head1.png');
        loadSpritesheetAsset(game, AssetName.greatsword, 'character/male/greatsword.png');
    }
};

const DEFAULT_SPRITESHEET_SIZE = {
    width: 128,
    height: 128
};

function loadSpritesheetAsset(
    game: Phaser.Game,
    name: string,
    pathFromBase: string,
    size?: LunnNet.Utils.Size
) {
    game.load.spritesheet(
        name,
        `${BASE_ASSET_DIR}/${pathFromBase}`,
        size ? size.width : DEFAULT_SPRITESHEET_SIZE.width,
        size ? size.height : DEFAULT_SPRITESHEET_SIZE.height
    );
}
