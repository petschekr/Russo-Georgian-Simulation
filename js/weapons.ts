export interface Weapon {
	readonly name: string;
	range: number;
	// Ignore arcing
	acrossGroundSpeed: number;
	efficacy: {
		[unitID: string]: number;
	};
	fireRate: number;
	// Effect of 0 = point (bullet, sabot, other projectiles)
	terminalEffect: number;
}

// https://en.wikipedia.org/wiki/List_of_equipment_of_the_Georgian_Armed_Forces
export const AK74: Weapon = {
	name: "AK-74"
};
