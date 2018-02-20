export interface Vector2 {
	x: number;
	y: number;
}

export interface Entity {
    readonly id: string;
    location: Vector2;
}

export class Utilities {
	static randomFloat(max: number = 1): number {
		return Math.random() * max;
	}
	static randomInt(max: number = 1): number {
		return Math.floor(this.randomFloat(max));
	}
}
