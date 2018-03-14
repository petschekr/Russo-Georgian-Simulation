import { Vector2, Waypoint, Entity, Utilities, NAVIGATION_THRESHOLD } from "./common";
import { Weapon, Weapons, UnitType } from "./weapons";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

type WeaponAmmunitionPair = [Weapon, {
	magazine: number; // Magazine capacity
	total: number; // Total number of rounds
	canResupply: boolean;
}];

export abstract class Unit implements Entity {
	public abstract readonly id: string;
	public abstract readonly type: UnitType;

	public abstract location: Vector2;

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

	private path: _turf.helpers.Feature<_turf.helpers.LineString, _turf.helpers.Properties> = turf.lineString([[0, 0], [0, 0]]);
	private navigationBegin: number = 0;
	private destination: Waypoint = { location: [0, 0] };
	private destinationArrived = true;
	public get traveling() { return !this.destinationArrived }

	constructor() {
		
	}

	public debugString(): string {
		return `lat: ${this.location[1]}, long: ${this.location[0]}`
	}

	public updatePath(time: number, navPoints: Vector2[], destination: Waypoint): void {
		this.navigationBegin = time;
		this.destination = destination;
		this.destinationArrived = false;
		this.path = turf.lineString([this.location, ...navPoints]);
	}
	public navigate(time: number): boolean {
		if (this.destinationArrived) {
			return true;
		}
		// Move to next navpoint (intermedite routed points to next waypoint contained in collection)
		let secondsNavigating = time - this.navigationBegin;
		let newLocation = turf.along(this.path, this.speed * secondsNavigating, { units: "meters" });
		this.location = turf.coordAll(newLocation)[0] as Vector2;

		if (turf.distance(this.location, this.destination.location, { units: "meters" }) < NAVIGATION_THRESHOLD) {
			// Destination arrived
			this.destinationArrived = true;
			// Spread out by fuzzing location
			this.fuzzLocation();
			return true;
		}
		return false;
	}
	public async tick(secondsElapsed: number): Promise<void> {
		secondsElapsed;
		// Engage enemy units
	}

	public abstract setSpeedForGrade(grade: number): void;

	public fuzzLocation(MAX_DISTANCE: number = 50): void {
		let point = turf.point(this.location);
		let distance = Utilities.randomInt(0, MAX_DISTANCE);
		let bearing = Utilities.randomInt(-180, 180);

		let fuzzedLocation = turf.destination(point, distance, bearing, { units: "meters" });
		this.location = turf.coordAll(fuzzedLocation)[0] as Vector2;
	}
}

export class TankT55 extends Unit {
	public readonly id: string;
	public readonly type = UnitType.HeavyArmor;
	public location: Vector2;

	private static creationCount = 0;

	public outOfAction = false;
	public outOfActionDecay = 60 * 15;
	public blocksOthers = true;

	// public readonly maxSpeed = 13; // ~30 miles per hour
	public readonly maxSpeed = 4.47;
	public speed = this.maxSpeed;

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

	constructor(location: Vector2) {
		super();
		this.id = `T-55_${TankT55.creationCount++}`;
		this.location = location;
		this.fuzzLocation();
	}

	public setSpeedForGrade(grade: number): void {
		this.speed = this.maxSpeed * Math.exp(-4 * grade);
		if (grade > this.maxClimbAbility) {
			this.speed = 0;
		}
	}
}

export class InfantrySquad extends Unit {
	public readonly id: string;
	public readonly type = UnitType.Infantry;
	public location: Vector2;
	
	private static creationCount = 0;
	protected memberCount: number = 4; // Soldiers in squad, multiply ammo by this

	public outOfAction = false;
	public outOfActionDecay = 60 * 5;
	public blocksOthers = false;

	public readonly maxSpeed = 1.34; // 3 miles per hour
	public speed = this.maxSpeed;
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

	constructor(location: Vector2) {
		super();
		this.id = `InfantrySquad(${this.memberCount})_${InfantrySquad.creationCount++}`;
		this.location = location;
		this.fuzzLocation();
	}

	// Source for humans: http://mtntactical.com/research/walking-uphill-10-grade-cuts-speed-13not-12/
	public setSpeedForGrade(grade: number): void {
		this.speed = this.maxSpeed * Math.exp(-1.5 * grade);
		if (grade > this.maxClimbAbility) {
			this.speed = 0;
		}
	}
}
