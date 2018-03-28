import { Vector2, Waypoint, Entity, Utilities, NAVIGATION_THRESHOLD } from "./common";
import { AgentCollection } from "./collections";
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
	public abstract readonly container: AgentCollection<Unit>;

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
	private destination: Waypoint = { location: [0, 0] };
	private destinationArrived = true;
	public get traveling() { return !this.destinationArrived }

	constructor() {
		
	}

	public debugString(): string {
		return `lat: ${this.location[1]}, long: ${this.location[0]}`
	}

	public updatePath(navPoints: Vector2[], destination: Waypoint): void {
		this.destination = destination;
		this.destinationArrived = false;
		this.path = turf.lineString([this.location, ...navPoints]);
	}
	public navigate(secondsElapsed: number): boolean {
		if (this.destinationArrived) {
			return true;
		}
		let effectiveSpeed = this.speed * (this.health / 100);
		if (this.isEngaging) {
			effectiveSpeed *= 0.2;
		}
		// Move to next navpoint (intermediate routed points to next waypoint contained in collection)
		let newLocation = turf.along(this.path, effectiveSpeed * secondsElapsed, { units: "meters" });
		this.location = Utilities.pointToVector(newLocation);
		// Consume path as unit moves along it
		
		// let pathPoints = turf.coordAll(this.path);
		// this.path = turf.lineSlice(newLocation, pathPoints[pathPoints.length - 1], this.path);
		
		// turf.lineSlice() is **insanely** slow so this is a good approximation for LineStrings with lots of points
		const getCoord = (i: number): Vector2 => {
			return this.path.geometry!.coordinates[i] as Vector2;
		};

		for (let i = 0; i < this.path.geometry!.coordinates.length - 1; i++) {
			// Determine if between two points
			let distanceDirect = Utilities.fastDistance(getCoord(0), getCoord(1));
			let distanceViaCurrentLocation = Utilities.fastDistance(this.location, getCoord(0)) + Utilities.fastDistance(this.location, getCoord(1));
			if (Math.abs(distanceDirect - distanceViaCurrentLocation) > 1) { // Less accurate than within a meter
				this.path.geometry!.coordinates.shift();
				i--; // Compensate for shifting
			}
			else {
				// Shorten this segment by replacing vertex behind location with location
				this.path.geometry!.coordinates[0] = this.location;
				break;
			}
		}
		//this.path.geometry!.coordinates.unshift(this.location);

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

	public isEngaging: boolean = false;
	public engage(collection: AgentCollection<Unit>, secondsElapsed: number): void {
		// Find best weapon to engage with
		let distanceToTarget = turf.distance(this.location, collection.location, { units: "meters" });

		let bestWeapon: WeaponAmmunitionPair | undefined;
		let bestWeaponDamagePerTick: number = 0;
		for (let weapon of this.weapons) {
			// Disqualifiers
			if (distanceToTarget > weapon[0].range || weapon[1].total <= 0) continue;

			let damagePerShot = weapon[0].efficacy.get(collection.type) || 0;
			let damage = damagePerShot * weapon[0].fireRate / 60 * secondsElapsed * Math.min(1, weapon[1].total / weapon[0].fireRate);
			if (damage > bestWeaponDamagePerTick) {
				bestWeapon = weapon;
				bestWeaponDamagePerTick = damage;
			}
		}
		if (!bestWeapon) return;

		let damage = 0;
		for (let shot = 0; shot < Math.min(bestWeapon[0].fireRate / 60 * secondsElapsed, bestWeapon[1].total); shot++, bestWeapon[1].total--) {
			if (Math.random() < bestWeapon[0].accuracy) {
				damage += (bestWeapon[0].efficacy.get(collection.type) || 0) * ((bestWeapon[0].range - distanceToTarget) / bestWeapon[0].range);
			}
		}
		console.log(`Applying ${damage} damage with ${bestWeapon[0].name}`);
		if (collection.damage(this.container, damage)) {
			// Target destroyed
			this.isEngaging = false;
		}
	}

	public abstract setSpeedForGrade(grade: number): void;

	public fuzzLocation(MAX_DISTANCE: number = 50): void {
		let point = turf.point(this.location);
		let distance = Utilities.randomInt(0, MAX_DISTANCE);
		let bearing = Utilities.randomInt(-180, 180);

		let fuzzedLocation = turf.destination(point, distance, bearing, { units: "meters" });
		this.location = turf.getCoord(fuzzedLocation) as Vector2;
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
	public health: number = 100;

	constructor(location: Vector2, public container: AgentCollection<Unit>) {
		super();
		this.id = `T-55_${TankT55.creationCount++}`;
		this.location = location;
		this.fuzzLocation();
	}

	public setSpeedForGrade(grade: number): void {
		this.speed = this.maxSpeed * Math.exp(-4 * grade);
		if (grade > this.maxClimbAbility) {
			console.error(`Max grade exceeded. Speed will be 0. ${this.id}`);
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
	public health: number = 100; // * this.memberCount;

	constructor(location: Vector2, public container: AgentCollection<Unit>) {
		super();
		this.id = `InfantrySquad(${this.memberCount})_${InfantrySquad.creationCount++}`;
		this.location = location;
		this.fuzzLocation();
	}

	// Source for humans: http://mtntactical.com/research/walking-uphill-10-grade-cuts-speed-13not-12/
	public setSpeedForGrade(grade: number): void {
		this.speed = this.maxSpeed * Math.exp(-1.5 * grade);
		if (grade > this.maxClimbAbility) {
			console.error(`Max grade exceeded. Speed will be 0. ${this.id}`);
			this.speed = 0;
		}
	}
}
