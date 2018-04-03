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
// Efficacy is basically how many of [UnitType] (as a percentage) can 1 unit kill in 1 unit of time
export namespace Weapons {
	export const AK74: Weapon = {
		name: "AK-74",
		range: 300,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 20],
			[UnitType.LightArmor, 5],
			[UnitType.HeavyArmor, 2]
		]),
		fireRate: 100,
		accuracy: 0.3,
		terminalEffect: 0
	};
	export const RGD5: Weapon = {
		name: "RGD-5 grenade",
		range: 50,
		efficacy: new Map([
			[UnitType.Infantry, 300],
			[UnitType.UnarmoredVehicle, 100],
			[UnitType.LightArmor, 8],
			[UnitType.HeavyArmor, 4]
		]),
		fireRate: 12,
		accuracy: 0.2,
		terminalEffect: 10
	};
	export const RPG: Weapon = {
		name: "Generic RPG",
		range: 200,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 100],
			[UnitType.LightArmor, 90],
			[UnitType.HeavyArmor, 80]
		]),
		fireRate: 2,
		accuracy: 0.2,
		terminalEffect: 10
	};
	export const DANA: Weapon = {
		name: "152mm SpGH DANA",
		range: 19000,
		efficacy: new Map([
			[UnitType.Infantry, 300],
			[UnitType.UnarmoredVehicle, 100],
			[UnitType.LightArmor, 75],
			[UnitType.HeavyArmor, 50]
		]),
		fireRate: 3,
		accuracy: 0.3,
		terminalEffect: 75
	};
	export const D22: Weapon = {
		name: "D-22 howitzer",
		range: 18000,
		efficacy: new Map([
			[UnitType.Infantry, 300],
			[UnitType.UnarmoredVehicle, 100],
			[UnitType.LightArmor, 75],
			[UnitType.HeavyArmor, 50]
		]),
		fireRate: 2,
		accuracy: 0.3,
		terminalEffect: 75
	};
	export const Grad: Weapon = {
		name: "BM-21 Grad",
		range: 30000,
		efficacy: new Map([
			[UnitType.Infantry, 300],
			[UnitType.UnarmoredVehicle, 100],
			[UnitType.LightArmor, 70],
			[UnitType.HeavyArmor, 40]
		]),
		fireRate: 40,
		accuracy: 0.2,
		terminalEffect: 30
	};
	export const D30: Weapon = {
		name: "D-30 howitzer",
		range: 15000,
		efficacy: new Map([
			[UnitType.Infantry, 300],
			[UnitType.UnarmoredVehicle, 100],
			[UnitType.LightArmor, 75],
			[UnitType.HeavyArmor, 50]
		]),
		fireRate: 6,
		accuracy: 0.4,
		terminalEffect: 60
	};
	export const D81: Weapon = {
		name: "T-72 D-81",
		range: 3000,
		efficacy: new Map([
			[UnitType.Infantry, 50],
			[UnitType.UnarmoredVehicle, 200],
			[UnitType.LightArmor, 100],
			[UnitType.HeavyArmor, 50]
		]),
		fireRate: 8,
		accuracy: 0.7,
		terminalEffect: 6
	};
	export const U5TS: Weapon = {
		name: "T-62 U-5TS",
		range: 2000,
		efficacy: new Map([
			[UnitType.Infantry, 50],
			[UnitType.UnarmoredVehicle, 200],
			[UnitType.LightArmor, 70],
			[UnitType.HeavyArmor, 35]
		]),
		fireRate: 8,
		accuracy: 0.6,
		terminalEffect: 5
	};
	export const D10: Weapon = {
		name: "T-55 D-10",
		range: 1600,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 200],
			[UnitType.LightArmor, 60],
			[UnitType.HeavyArmor, 30]
		]),
		fireRate: 4,
		accuracy: 0.5,
		terminalEffect: 4
	};
	export const SGMT: Weapon = {
		name: "T-55 SGMT",
		range: 1000,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 75],
			[UnitType.LightArmor, 5],
			[UnitType.HeavyArmor, 2]
		]),
		fireRate: 240,
		accuracy: 0.3,
		terminalEffect: 0
	}
	export const NSV: Weapon = {
		name: "Cobra NSV",
		range: 2000,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 40],
			[UnitType.LightArmor, 10],
			[UnitType.HeavyArmor, 6]
		]),
		fireRate: 300,
		accuracy: 0.4,
		terminalEffect: 0
	}
	export const DShkM: Weapon = {
		name: "",
		range: 2000,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 40],
			[UnitType.LightArmor, 10],
			[UnitType.HeavyArmor, 6]
		]),
		fireRate: 240,
		accuracy: 0.4,
		terminalEffect: 0
	}
	export const KPVT: Weapon = {
		name: "KPVT",
		range: 3000,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 50],
			[UnitType.LightArmor, 15],
			[UnitType.HeavyArmor, 10]
		]),
		fireRate: 240,
		accuracy: 0.5,
		terminalEffect: 0
	}
	export const S2A42: Weapon = {
		name: "S2A42",
		range: 2000,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 70],
			[UnitType.LightArmor, 30],
			[UnitType.HeavyArmor, 15]
		]),
		fireRate: 220,
		accuracy: 0.6,
		terminalEffect: 3
	}
	export const PKMT: Weapon = {
		name: "PKMT",
		range: 1500,
		efficacy: new Map([
			[UnitType.Infantry, 100],
			[UnitType.UnarmoredVehicle, 75],
			[UnitType.LightArmor, 5],
			[UnitType.HeavyArmor, 2]
		]),
		fireRate: 250,
		accuracy: 0.4,
		terminalEffect: 0
	}
}
