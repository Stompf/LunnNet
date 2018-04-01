const BASE_ASSET_DIR = process.env.PUBLIC_URL + '/assets/games/isometric';

export enum AssetName {
    steel_armor = 'steel_armor',
    male_head1 = 'male_head1',
    male_head2 = 'male_head2',
    male_head3 = 'male_head3',
    greatsword = 'greatsword',
    buckler = 'buckler',
    clothes = 'clothes',
    dagger = 'dagger',
    greatbow = 'greatbow',
    greatstaff = 'greatstaff',
    leather_armor = 'leather_armor',
    longbow = 'longbow',
    longsword = 'longsword',
    rod = 'rod',
    shield = 'shield',
    shortbow = 'shortbow',
    shortsword = 'shortsword',
    slingshot = 'slingshot',
    staff = 'staff',
    wand = 'wand'
}

export const AssetLoader = {
    load(game: Phaser.Game) {
        // Character
        loadSpriteSheetAsset(game, AssetName.steel_armor, 'character/male/steel_armor.png');
        loadSpriteSheetAsset(game, AssetName.male_head1, 'character/male/male_head1.png');

        // Weapons
        loadSpriteSheetAsset(game, AssetName.greatsword, 'character/male/greatsword.png');
    }
};

const DEFAULT_SPRITE_SHEET_SIZE = {
    width: 128,
    height: 128
};

function loadSpriteSheetAsset(
    game: Phaser.Game,
    name: string,
    pathFromBase: string,
    size?: LunnNet.Utils.Size
) {
    game.load.spritesheet(
        name,
        `${BASE_ASSET_DIR}/${pathFromBase}`,
        size ? size.width : DEFAULT_SPRITE_SHEET_SIZE.width,
        size ? size.height : DEFAULT_SPRITE_SHEET_SIZE.height
    );
}
