import { Vector2, Waypoint, Entity, Utilities } from "./common";
import { Weapon, Weapons, UnitType } from "./weapons";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

type WeaponAmmunitionPair = [Weapon, {
	magazine: number; // Magazine capacity
	total: number; // Total number of rounds
	canResupply: boolean;
}];

export abstract class Unit {
	public abstract readonly id: string;
	public abstract readonly type: UnitType;

	public abstract location: Vector2;
	public abstract waypoints: Waypoint[];
	public abstract rotation: number; // In radians

	public abstract outOfAction: boolean;
	public abstract outOfActionDecay: number // In seconds
	public abstract blocksOthers: boolean;

	public abstract speed: number; // In meters / second on improved surface like a road
	public abstract rotationSpeed: number; // In radians / second
	public abstract maxClimbAbility: number; // Slope (meters/meter)
	public abstract movement: {
		steppe: number;
		forest: number;
		urban: number;
	};
	public abstract visibility: {
		range: number; // In meters
		fieldOfView: number; // In radians, centered on this.rotation
	};
	
	public abstract weapons: WeaponAmmunitionPair[];
	public abstract health: number; // Health points

	private destinationArrived = false;

	constructor() {
		
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

export class TankT55 extends Unit {
	public readonly id: string;
	public readonly type = UnitType.HeavyArmor;
	public location: Vector2;
	public waypoints: Waypoint[];
	public rotation = 0;

	private static creationCount = 0;


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
	public health: number = 1000;

	constructor(location: Vector2, waypoints?: Waypoint[]) {
		super();
		this.id = `T-55_${TankT55.creationCount++}`;
		this.location = location;
		this.waypoints = waypoints || [];
	}
}

export class InfantrySquad extends Unit {
	public readonly id: string;
	public readonly type = UnitType.Infantry;
	public location: Vector2;
	public waypoints: Waypoint[];
	public rotation = 0;
	
	private static creationCount = 0;
	protected memberCount: number = 4; // Soldiers in squad, multiply ammo by this

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
	public health: number = 100 * this.memberCount;

	constructor(location: Vector2, waypoints?: Waypoint[]) {
		super();
		this.id = `InfantrySquad(${this.memberCount})_${InfantrySquad.creationCount++}`;
		this.location = location;
		this.waypoints = waypoints || [];
	}
}
