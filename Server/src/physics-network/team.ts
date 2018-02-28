export const enum TeamSide {
    Left,
    Right
}

export class Team {

    private score: number = 0;
    private color: number;

    get TeamSide() {
        return this.teamSide;
    }

    get Color() {
        return this.color;
    }

    get Score() {
        return this.score;
    }

    constructor(private teamSide: TeamSide) {
        this.resetScore();
        this.color = this.teamSide === TeamSide.Left
            ? 0xFF0000
            : 0x0000FF;
    }

    resetScore() {
        this.score = 0;
    }

    addScore() {
        this.score++;
    }
}