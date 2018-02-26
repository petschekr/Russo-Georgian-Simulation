import { Vector2, Entity } from "./common";
import { Weapon } from "./weapons";

interface Unit {
	location: Vector2;
	rotation: number; // In radians

	outOfAction: boolean;
	outOfActionDecay: number // In seconds
	blocksOthers: boolean;

	speed: number; // In meters / second
	rotationSpeed: number; // In radians / second
	maxClimbAbility: number; // In 10 meter grade average

	visibility: {
		range: number; // In meters
		fieldOfView: number; // In radians, centered on this.rotation
	};
	
	weapons: Weapon[];
	ammunition: {
		magazine: number; // Magazine capacity
		total: number; // Total number of rounds
		canResupply: boolean;
	};
	
	health: number; // Percentage
}

export abstract class Agent implements Entity {
	public readonly id: string = "N/A";
	public location: Vector2;

	constructor(location: Vector2, waypoints: Vector2[]) {
		this.location = location;
	}

	public tick(secondsElapsed: number): void {
		// Do something
	}
}

export class InfantrySquad extends Agent implements Unit {
	private static creationCount = 0;
	public readonly id: string;

	constructor(location: Vector2) {
		super(location);
		this.id = `Squad_${InfantrySquad.creationCount++}`;
	}
}
