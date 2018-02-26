export interface Weapon {
	readonly name: string;
	range: number;
	// Ignore arcing
	acrossGroundSpeed: number;
	efficacy: {
		[unitID: string]: number
	};
	fireRate: number;
	// Effect of 0 = point (bullet, sabot, other projectiles)
	terminalEffect: number;
}