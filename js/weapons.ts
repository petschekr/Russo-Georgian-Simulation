import { InfantrySquad, TankT55, Unit } from "./units";

export enum UnitType {
	None,
	Infantry,
	HeavyArmor,
	LightArmor,
	UnarmoredVehicle
}

export interface Weapon {
	readonly name: string;
	range: number; // in meters
	//acrossGroundSpeed: number; // Instant for now, ignore arcing
	efficacy: Map<UnitType, number>,
	fireRate: number; // Rounds per minute
	accuracy: number; // 0 to 1
	// Effect of 0 = point (bullet, sabot, other projectiles)
	terminalEffect: number; // Meters
}

// https://en.wikipedia.org/wiki/List_of_equipment_of_the_Georgian_Armed_Forces
export namespace Weapons {
	export const AK74: Weapon = {
		name: "AK-74",
		range: 300,
		efficacy: new Map([
			[UnitType.Infantry, 20],
			[UnitType.UnarmoredVehicle, 15],
			[UnitType.LightArmor, 0.5],
			[UnitType.HeavyArmor, 0.1]
		]),
		fireRate: 100,
		accuracy: 0.3,
		terminalEffect: 0
	};
	export const DANA: Weapon = {
		name: "152mm SpGH DANA",
		range: 18000,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 100],
			[UnitType.LightArmor, 50],
			[UnitType.HeavyArmor, 45]
		]),
		fireRate: 3,
		accuracy: 0.2,
		terminalEffect: 75
	};
	export const D10: Weapon = {
		name: "T-55 D-10",
		range: 1400,
		efficacy: new Map([
			[UnitType.Infantry, 90],
			[UnitType.UnarmoredVehicle, 100],
			[UnitType.LightArmor, 100],
			[UnitType.HeavyArmor, 80]
		]),
		fireRate: 4,
		accuracy: 0.7,
		terminalEffect: 10
	};
	export const SGMT: Weapon = {
		name: "T-55 SGMT",
		range: 1000,
		efficacy: new Map([
			[UnitType.Infantry, 40],
			[UnitType.UnarmoredVehicle, 30],
			[UnitType.LightArmor, 0.5],
			[UnitType.HeavyArmor, 0.5]
		]),
		fireRate: 600,
		accuracy: 0.4,
		terminalEffect: 0
	}
}
