import { Vector2, Entity } from "./common";
import { Weapon } from "./weapons";

interface Unit {
	location: Vector2;
	rotation: number;

	outOfAction: boolean;
	outOfActionDecay: number;
	blocksOthers: boolean;

	speed: number;
	rotationSpeed: number;
	maxClimbAbility: number;

	visibility: {
		range: number;
		fieldOfView: number;
	};
	
	weapons: Weapon[];
	ammunition: {
		magazine: number;
		total: number;
		canResupply: boolean;
	};
	
	health: number;
	morale: number;
}

abstract class Agent implements Entity, Unit {
	public readonly id: string;
	public location: Vector2;

	constructor(location?: Vector2) {

	}

	public randomizeLocation(): void {

	}
}