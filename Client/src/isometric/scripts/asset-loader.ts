const BASE_ASSET_DIR = process.env.PUBLIC_URL + '/assets/games/isometric';

export enum MaleWeapons {
    greatsword = 'greatsword',
    buckler = 'buckler',
    dagger = 'dagger',
    greatbow = 'greatbow',
    greatstaff = 'greatstaff',
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

export enum MaleArmor {
    head1 = 'male_head1',
    head2 = 'male_head2',
    head3 = 'male_head3',
    steel_armor = 'male_steel_armor',
    leather_armor = 'male_leather_armor',
    clothes = 'male_clothes'
}

export const AssetLoader = {
    load(game: Phaser.Game) {
        // Character
        loadSpriteSheetAsset(game, MaleArmor.steel_armor, 'character/male/steel_armor.png');
        loadSpriteSheetAsset(game, MaleArmor.clothes, 'character/male/clothes.png');
        loadSpriteSheetAsset(game, MaleArmor.leather_armor, 'character/male/leather_armor.png');
        loadSpriteSheetAsset(game, MaleArmor.head1, 'character/male/male_head1.png');
        loadSpriteSheetAsset(game, MaleArmor.head2, 'character/male/male_head2.png');
        loadSpriteSheetAsset(game, MaleArmor.head3, 'character/male/male_head3.png');

        // Weapons
        loadSpriteSheetAsset(game, MaleWeapons.greatsword, 'character/male/greatsword.png');
        loadSpriteSheetAsset(game, MaleWeapons.wand, 'character/male/wand.png');
        loadSpriteSheetAsset(game, MaleWeapons.dagger, 'character/male/dagger.png');
        loadSpriteSheetAsset(game, MaleWeapons.buckler, 'character/male/buckler.png');
        loadSpriteSheetAsset(game, MaleWeapons.greatstaff, 'character/male/greatstaff.png');
        loadSpriteSheetAsset(game, MaleWeapons.longbow, 'character/male/longbow.png');
        loadSpriteSheetAsset(game, MaleWeapons.longsword, 'character/male/longsword.png');
        loadSpriteSheetAsset(game, MaleWeapons.rod, 'character/male/rod.png');
        loadSpriteSheetAsset(game, MaleWeapons.greatbow, 'character/male/greatbow.png');
        loadSpriteSheetAsset(game, MaleWeapons.slingshot, 'character/male/slingshot.png');
        loadSpriteSheetAsset(game, MaleWeapons.shortsword, 'character/male/shortsword.png');
        loadSpriteSheetAsset(game, MaleWeapons.shortbow, 'character/male/shortbow.png');
        loadSpriteSheetAsset(game, MaleWeapons.shield, 'character/male/shield.png');
        loadSpriteSheetAsset(game, MaleWeapons.staff, 'character/male/staff.png');
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
