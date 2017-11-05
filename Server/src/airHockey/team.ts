export const enum TeamSide {
    Left,
    Right
}

export class Team {
    private teamSide: TeamSide;
    private score: number;

    get TeamSide() {
        return this.teamSide;
    }

    get Score() {
        return this.score;
    }

    constructor(teamSide: TeamSide) {
        this.teamSide = teamSide;
        this.resetScore();
    }

    resetScore() {
        this.score = 0;
    }

    addScore() {
        this.score++;
    }
}
