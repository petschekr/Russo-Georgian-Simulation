import { Vector2, Waypoint, Entity, Utilities } from "./common";
import { Weapon, Weapons, UnitType } from "./weapons";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

type WeaponAmmunitionPair = [Weapon, {
	magazine: number; // Magazine capacity
	total: number; // Total number of rounds
	canResupply: boolean;
}];

export interface Unit extends Entity {
	type: UnitType;
	location: Vector2;
	waypoints: Waypoint[];
	rotation: number; // In radians

	outOfAction: boolean;
	outOfActionDecay: number // In seconds
	blocksOthers: boolean;

	speed: number; // In meters / second on improved surface like a road
	rotationSpeed: number; // In radians / second
	maxClimbAbility: number; // Slope (meters/meter)
	movement: {
		steppe: number;
		forest: number;
		urban: number;
	};

	visibility: {
		range: number; // In meters
		fieldOfView: number; // In radians, centered on this.rotation
	};
	
	weapons: WeaponAmmunitionPair[];
	
	health: number; // Percentage

	debugString(): string;
}

export abstract class Agent implements Unit {
	public readonly type: UnitType = UnitType.None;

	public readonly id: string = "N/A";
	public location: Vector2;
	public waypoints: Waypoint[];
	public rotation = NaN;
	public health: number;

	// Satisfies the implements Unit
	public outOfAction = false;
	public outOfActionDecay = NaN;
	public blocksOthers = true;
	public speed = NaN;
	public rotationSpeed = Infinity;
	public maxClimbAbility = NaN;
	public movement = {
		steppe: NaN,
		forest: NaN,
		urban: NaN
	};
	public visibility = {
		range: NaN,
		fieldOfView: 0
	};
	public weapons: WeaponAmmunitionPair[] = [];

	private destinationArrived = false;

	constructor(location: Vector2, waypoints?: Waypoint[]) {
		this.location = location;
		this.waypoints = waypoints || [];
		this.health = 100;
	}

	public addWaypoints(waypoints: Waypoint | Waypoint[]) {
		this.waypoints = this.waypoints.concat(waypoints);
	}

	public debugString(): string {
		return `lat: ${this.location[1]}, long: ${this.location[0]}, rotation: ${Utilities.radiansToDegrees(this.rotation)}, pending waypoints: ${this.waypoints.length}`
	}

	public tick(time: Date, secondsElapsed: number): void {
		// Move to next waypoint
		if (this.waypoints.length < 1) {
			return;
		}
		if (!this.destinationArrived) {
			let path = turf.shortestPath(this.location, this.waypoints[0].location);
			let newLocation = turf.along(path, this.speed, { units: "meters" });
			this.location = newLocation.geometry!.coordinates as [number, number];
		}
		if (turf.distance(this.location, this.waypoints[0].location, { units: "kilometers" }) < 1 / 10) {
			// Destination arrived (within 100 meters)
			if (time.valueOf() < this.waypoints[0].time.valueOf()) {
				// Pause until time reached
				this.destinationArrived = true;
			}
			else {
				this.waypoints.shift();
				this.destinationArrived = false;
			}
		}
	}
}

export class TankT55 extends Agent implements Unit {
	public readonly type = UnitType.HeavyArmor;

	private static creationCount = 0;
	public readonly id: string;

	public rotation = 0;

	public outOfAction = false;
	public outOfActionDecay = 60 * 15;
	public blocksOthers = true;

	public speed = 13;
	public rotationSpeed = Infinity;
	public maxClimbAbility = 0.6;
	public movement = {
		steppe: 0.7,
		forest: 0.1,
		urban: 0.25
	};

	public visibility = {
		range: 1600,
		fieldOfView: Utilities.degreesToRadians(80)
	};
	
	public weapons: WeaponAmmunitionPair[] = [
		[Weapons.D10, {
			magazine: 1,
			total: 35,
			canResupply: false
		}],
		[Weapons.SGMT, {
			magazine: 250,
			total: 500,
			canResupply: false
		}]
	];

	constructor(location: Vector2, waypoints?: Waypoint[]) {
		super(location, waypoints);
		this.id = `T-55_${TankT55.creationCount++}`;
	}
}

export class InfantrySquad extends Agent implements Unit {
	public readonly type = UnitType.Infantry;

	private static creationCount = 0;
	public readonly id: string;

	public rotation = 0;

	public outOfAction = false;
	public outOfActionDecay = 60 * 5;
	public blocksOthers = false;

	public speed = 2;
	public rotationSpeed = Infinity;
	public maxClimbAbility = 1;
	public movement = {
		steppe: 0.95,
		forest: 0.9,
		urban: 0.6
	};

	public visibility = {
		range: 500,
		fieldOfView: Utilities.degreesToRadians(60)
	};
	
	public weapons: WeaponAmmunitionPair[] = [
		[Weapons.AK74, {
			magazine: 30,
			total: 180,
			canResupply: false
		}]
	];

	protected memberCount: number = 4; // Soldiers in squad, multiply ammo by this

	constructor(location: Vector2, waypoints?: Waypoint[]) {
		super(location, waypoints);
		this.id = `InfantrySquad(${this.memberCount})_${InfantrySquad.creationCount++}`;
	}
}
