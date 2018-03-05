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
	// Effect of 0 = point (bullet, sabot, other projectiles)
	terminalEffect: number; // Meters
}

// https://en.wikipedia.org/wiki/List_of_equipment_of_the_Georgian_Armed_Forces
export namespace Weapons {
	export const AK74: Weapon = {
		name: "AK-74",
		range: 300,
		efficacy: new Map([
			[UnitType.Infantry, 1],
			[UnitType.UnarmoredVehicle, 0.8],
			[UnitType.LightArmor, 0.05],
			[UnitType.HeavyArmor, 0.01]
		]),
		fireRate: 100,
		terminalEffect: 0
	};
	export const DANA: Weapon = {
		name: "152mm SpGH DANA",
		range: 18000,
		efficacy: new Map([
			[UnitType.Infantry, 1],
			[UnitType.UnarmoredVehicle, 1],
			[UnitType.LightArmor, 0.5],
			[UnitType.HeavyArmor, 0.5]
		]),
		fireRate: 3,
		terminalEffect: 75
	};
	export const D10: Weapon = {
		name: "T-55 D-10",
		range: 1400,
		efficacy: new Map([
			[UnitType.Infantry, 0.9],
			[UnitType.UnarmoredVehicle, 1],
			[UnitType.LightArmor, 1],
			[UnitType.HeavyArmor, 1]
		]),
		fireRate: 4,
		terminalEffect: 10
	};
	export const SGMT: Weapon = {
		name: "T-55 SGMT",
		range: 1000,
		efficacy: new Map([
			[UnitType.Infantry, 1],
			[UnitType.UnarmoredVehicle, 0.95],
			[UnitType.LightArmor, 0.05],
			[UnitType.HeavyArmor, 0.05]
		]),
		fireRate: 600,
		terminalEffect: 0
	}
}
