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
			[UnitType.Infantry, 50],
			[UnitType.UnarmoredVehicle, 4],
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
			[UnitType.LightArmor, 75],
			[UnitType.HeavyArmor, 50]
		]),
		fireRate: 3,
		accuracy: 0.2,
		terminalEffect: 75
	};
	export const D81: Weapon = {
		name: "T-72 D-81",
		range: 3000,
		efficacy: new Map([
			[UnitType.Infantry, 50],
			[UnitType.UnarmoredVehicle, 100],
			[UnitType.LightArmor, 80],
			[UnitType.HeavyArmor, 40]
		]),
		fireRate: 8,
		accuracy: 0.7,
		terminalEffect: 5
	};
	export const D10: Weapon = {
		name: "T-55 D-10",
		range: 1600,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 100],
			[UnitType.LightArmor, 60],
			[UnitType.HeavyArmor, 30]
		]),
		fireRate: 4,
		accuracy: 0.6,
		terminalEffect: 5
	};
	export const SGMT: Weapon = {
		name: "T-55 SGMT",
		range: 1000,
		efficacy: new Map([
			[UnitType.Infantry, 75],
			[UnitType.UnarmoredVehicle, 6],
			[UnitType.LightArmor, 1],
			[UnitType.HeavyArmor, 0.2]
		]),
		fireRate: 600,
		accuracy: 0.3,
		terminalEffect: 0
	}
	export const NSV: Weapon = {
		name: "Cobra NSV",
		range: 2000,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 12],
			[UnitType.LightArmor, 2],
			[UnitType.HeavyArmor, 0.3]
		]),
		fireRate: 750,
		accuracy: 0.4,
		terminalEffect: 0
	}
	export const DShkM: Weapon = {
		name: "DANA DShkM",
		range: 2000,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 12],
			[UnitType.LightArmor, 2],
			[UnitType.HeavyArmor, 0.3]
		]),
		fireRate: 600,
		accuracy: 0.4,
		terminalEffect: 0
	}
	export const KPVT: Weapon = {
		name: "KPVT",
		range: 3000,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 15],
			[UnitType.LightArmor, 2.5],
			[UnitType.HeavyArmor, 0.4]
		]),
		fireRate: 600,
		accuracy: 0.5,
		terminalEffect: 0
	}
	export const S2A42: Weapon = {
		name: "S2A42",
		range: 2000,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 25],
			[UnitType.LightArmor, 10],
			[UnitType.HeavyArmor, 2.5]
		]),
		fireRate: 550,
		accuracy: 0.6,
		terminalEffect: 3
	}
	export const PKMT: Weapon = {
		name: "PKMT",
		range: 1500,
		efficacy: new Map([
			[UnitType.Infantry, 75],
			[UnitType.UnarmoredVehicle, 6],
			[UnitType.LightArmor, 1],
			[UnitType.HeavyArmor, 0.2]
		]),
		fireRate: 750,
		accuracy: 0.4,
		terminalEffect: 0
	}
}
