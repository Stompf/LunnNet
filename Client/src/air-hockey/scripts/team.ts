export const enum TeamSide {
    Left,
    Right
}

export class Team {

    private _teamSide: TeamSide;
    private _score!: number;
    private _color!: number;

    get TeamSide() {
        return this._teamSide;
    }

    get Color() {
        return this._color;
    }

    get Score() {
        return this._score;
    }

    constructor(teamSide: TeamSide) {
        this._teamSide = teamSide;
        this.resetScore();
        this.setColor();
    }

    resetScore() {
        this._score = 0;
    }

    addScore() {
        this._score++;
    }

    private setColor() {
        if (this._teamSide === TeamSide.Left) {
            this._color = 0xFF0000;
        } else {
            this._color = 0x0000FF;
        }
    }
}