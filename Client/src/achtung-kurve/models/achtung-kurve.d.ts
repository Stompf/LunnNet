export interface PlayerData {
    playerId: string;
    activeTime: Date;
}

export interface PlayerOptions {
    speed: number;
    movement: number;
    diameter: number;
    position: WebKitPoint;
    id: string;
    color: number;
}
