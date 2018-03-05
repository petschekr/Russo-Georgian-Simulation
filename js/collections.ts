import { Vector2, Waypoint, Entity, Team } from "./common";
import { Unit, TankT55, InfantrySquad } from "./units";
import { getDirections } from "./directions";
import { map } from "./main";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

// Groups of infantry, tanks, etc.
abstract class AgentCollection<T extends Unit> implements Entity {
	public readonly id: string;
	protected _team: Team = Team.None;
	public get team(): Team { return this._team }
	public waypoints: Waypoint[];
	public intermediatePoints: Vector2[];

	public units: T[];

	private readonly locationSourceID: string;
	private locationSource: mapboxgl.GeoJSONSource;
	private readonly pathSourceID: string;
	private pathSource: mapboxgl.GeoJSONSource;
	private color: string;

	// Get centroid location average of all included units
	get location(): Vector2 {
		let x = 0;
		let y = 0;
		for (let unit of this.units) {
			x += unit.location[0];
			y += unit.location[1];
		}
		x /= this.units.length;
		y /= this.units.length;
		
		return [x, y];
	}

	constructor(id: string, team: Team, units: T[], waypoints?: Waypoint[]) {
		this.id = id.replace(/ /g, "_");
		this._team = team;
		this.units = units;

		this.locationSourceID = `${this.id}_location`;
		this.pathSourceID = `${this.id}_path`;
		this.waypoints = waypoints || [];
		this.intermediatePoints = [this.location, this.location];

		console.log(this.locationSourceID, this.pathSourceID);
		map.addSource(this.locationSourceID, {
			type: "geojson",
			data: turf.point(this.location)
		});
		this.locationSource = map.getSource(this.locationSourceID) as mapboxgl.GeoJSONSource;
		map.addSource(this.pathSourceID, {
			type: "geojson",
			data: turf.lineString(this.intermediatePoints)
		});
		this.pathSource = map.getSource(this.pathSourceID) as mapboxgl.GeoJSONSource;

		switch (team) {
			case Team.Russia:
				this.color = "#FF4136";
				break;
			case Team.Georgia:
				this.color = "#0074D9";
				break;
			default:
				this.color = "#FFFFFF";
		}

		this.drawInit();
		// TEMPORARY
		this.navigate();
	}

	public async navigate(): Promise<void> {
		let next = this.waypoints.shift();
		if (!next) {
			return;
		}
		this.intermediatePoints = await getDirections(this.location, next.location);
		this.pathSource.setData(turf.lineString(this.intermediatePoints));
	}

	public tick(time: Date, secondsElapsed: number): void {
		// Tick through subunits
		for (let unit of this.units) {
			unit.tick(time, secondsElapsed);
		}
	}

	private drawInit(): void {
		map.addLayer({
			"id": this.locationSourceID,
			"source": this.locationSourceID,
			"type": "circle",
			"paint": {
				"circle-radius": 10,
				"circle-color": this.color
			}
		});
		map.addLayer({
			"id": this.pathSourceID,
			"source": this.pathSourceID,
			"type": "line",
			"layout": {
				"line-join": "round",
				"line-cap": "round"
			},
			//"maxzoom": 15,
			"paint": {
				"line-color": this.color,
				"line-width": 8
			}
		});
	}

	// public split(numberPerGroup: number[]): this[] {
	// 	let collections: this[] = [];
	// 	let currentCollection: T[] = [];
	// 	let currentIndex = 0;
	// 	for (let size of numberPerGroup) {
	// 		collections.push(new (this)(this.units.slice(currentIndex, currentIndex + size)));
	// 		currentIndex += size;
	// 	}
	// 	return collections;
	// }
	// public splitEvenly(groups: number): this[] {
	// 	let numberPerGroup = Math.floor(this.units.length / groups);
	// 	// For numbers of units that don't divide evenly
	// 	let firstUnitAdditional = this.units.length % groups;

	// 	let groupSizes: number[] = [];
	// 	for (let i = 0; i < groups; i++) {
	// 		if (i === 0) {
	// 			groupSizes[i] = firstUnitAdditional + numberPerGroup;
	// 		}
	// 		else {
	// 			groupSizes[i] = numberPerGroup;
	// 		}
	// 	}
	// 	return this.split(groupSizes);
	// }
}

export class InfantryBattalion extends AgentCollection<InfantrySquad> {
	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let units: InfantrySquad[] = [];
		for (let i = 0; i < unitNumber; i++) {
			units.push(new InfantrySquad(location, waypoints));
		}

		let id = `InfantryBattalion_${Team[team]}_${name}`;
		super(id, team, units, waypoints);
	}
}

export class TankBattalion extends AgentCollection<TankT55> {
	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let units: TankT55[] = [];
		for (let i = 0; i < unitNumber; i++) {
			units.push(new TankT55(location, waypoints));
		}

		let id = `InfantryBattalion_${Team[team]}_${name}`;
		super(id, team, units, waypoints);
	}
}
