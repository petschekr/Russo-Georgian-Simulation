declare const moment: any;

export type Vector2 = [number, number]; // Note! Longitude, Latitude (x, y)
export interface Waypoint {
	location: Vector2,
	time: Date
}

export interface Entity {
    readonly id: string;
	location: Vector2;
	
	tick(time: Date, secondsElapsed: number): void; // Do something every time iteration
}

export class Utilities {
	static randomFloat(max: number = 1): number {
		return Math.random() * max;
	}
	static randomInt(max: number = 1): number {
		return Math.floor(this.randomFloat(max));
	}
	static degreesToRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}
	static radiansToDegrees(radians: number): number {
		return radians * (180 / Math.PI);
	}
}

// >"Team"
export enum Team {
	Russia, Georgia, SouthOssetia, None
}

export class Dispatcher {
	private tickCount: number = 0;
	private readonly secondsPerTick: number = 60 * 1; // 1 minute elapses per tick

	private time: Date;
	get formattedTime(): string {
		return moment(this.time).utc().format("DD MMM YY HHmm[Z]");
	}

	public entities: Entity[];

	constructor(start: Date, entities: Entity[]) {
		this.time = start;
		this.entities = entities;
	}

	public addEntities(entities: Entity | Entity[]): void {
		this.entities = this.entities.concat(entities);
	}
	public removeEntity(entityID: string): Entity | null {
		let removeIndex = this.entities.findIndex(entity => entity.id === entityID);
		if (removeIndex === -1) {
			return null;
		}
		return this.entities.splice(removeIndex, 1)[0];
	}

	public tick(): void {
		this.time.setSeconds(this.time.getSeconds() + this.secondsPerTick);

		for (let entity of this.entities) {
			entity.tick(this.time, this.secondsPerTick);
		}
	}
}
