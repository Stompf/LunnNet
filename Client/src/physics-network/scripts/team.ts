export const enum TeamSide {
    Left,
    Right
}

export class Team {

    score: number = 0;

    get TeamSide() {
        return this.teamSide;
    }

    constructor(private teamSide: TeamSide) { }

    resetScore() {
        this.score = 0;
    }
}