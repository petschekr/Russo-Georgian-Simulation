import { Vector2, Waypoint, Entity, Team } from "./common";
import { Agent, TankT55, InfantrySquad } from "./units";

// Groups of infantry, tanks, etc.
abstract class AgentCollection<T extends Agent> implements Entity {
	public readonly id: string = "N/A";
	protected _team: Team = Team.None;
	public get team(): Team { return this._team }
	public waypoints: Waypoint[];

	protected units: T[];
	// Get centroid location average of all included units
	get location(): Vector2 {
		let x = 0;
		let y = 0;
		for (let unit of this.units) {
			x += unit.location[0];
			y += unit.location[1];
		}
		x /= this.units.length;
		y /= this.units.length;
		
		return [y, x];
	}

	constructor(units: T[], waypoints?: Waypoint[]) {
		this.units = units;
		this.waypoints = waypoints || [];
	}

	public addUnits(unit: T | T[]) {
		this.units = this.units.concat(unit);
	}

	public addWaypoints(waypoints: Waypoint | Waypoint[]) {
		this.waypoints = this.waypoints.concat(waypoints);
	}

	public tick(time: Date, secondsElapsed: number): void {
		// Tick through subunits
		for (let unit of this.units) {
			unit.tick(time, secondsElapsed);
		}
	}

	// public split(numberPerGroup: number[]): this[] {
	// 	let collections: this[] = [];
	// 	let currentCollection: T[] = [];
	// 	let currentIndex = 0;
	// 	for (let size of numberPerGroup) {
	// 		collections.push(new (this)(this.units.slice(currentIndex, currentIndex + size)));
	// 		currentIndex += size;
	// 	}
	// 	return collections;
	// }
	// public splitEvenly(groups: number): this[] {
	// 	let numberPerGroup = Math.floor(this.units.length / groups);
	// 	// For numbers of units that don't divide evenly
	// 	let firstUnitAdditional = this.units.length % groups;

	// 	let groupSizes: number[] = [];
	// 	for (let i = 0; i < groups; i++) {
	// 		if (i === 0) {
	// 			groupSizes[i] = firstUnitAdditional + numberPerGroup;
	// 		}
	// 		else {
	// 			groupSizes[i] = numberPerGroup;
	// 		}
	// 	}
	// 	return this.split(groupSizes);
	// }
}

export class InfantryBattalion extends AgentCollection<InfantrySquad> {
	public readonly id: string;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let units: InfantrySquad[] = [];
		for (let i = 0; i < unitNumber; i++) {
			units.push(new InfantrySquad(location, waypoints));
		}
		super(units, waypoints);
		
		this._team = team;
		this.id = `InfantryBattalion(${Team[this.team]})_${name}`;
	}
}

export class TankBattalion extends AgentCollection<TankT55> {
	public readonly id: string;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let units: TankT55[] = [];
		for (let i = 0; i < unitNumber; i++) {
			units.push(new TankT55(location, waypoints));
		}
		super(units, waypoints);

		this._team = team;
		this.id = `InfantryBattalion(${Team[this.team]})_${name}`;
	}
}
