// Groups of infantry, tanks, etc.
abstract class AgentCollection<T extends Agent> {
	public readonly id: string = "N/A";

	private units: T[];
	// Get centroid location average of all included units
	get location(): number {
		return NaN;
	}

	constructor(units: T[]) {
		this.units = units;
	}

	public addUnits(unit: T | T[]) {
		this.units = this.units.concat(unit);
	}
}