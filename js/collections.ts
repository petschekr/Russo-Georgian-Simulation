import { Vector2, Entity } from "./common";
import { Agent } from "./units";

// Groups of infantry, tanks, etc.
abstract class AgentCollection<T extends Agent> implements Entity {
	public readonly id: string = "N/A";

	private units: T[];
	// Get centroid location average of all included units
	get location(): Vector2 {
		return { x: NaN, y: NaN };
	}

	constructor(units: T[]) {
		this.units = units;
	}

	public addUnits(unit: T | T[]) {
		this.units = this.units.concat(unit);
	}

	public tick(secondsElapsed: number): void {
		// Do something
	}
}
