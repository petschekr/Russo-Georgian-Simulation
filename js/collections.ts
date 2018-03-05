import { Vector2, Waypoint, Entity, Team, NAVIGATION_THRESHOLD } from "./common";
import { Unit, TankT55, InfantrySquad } from "./units";
import { UnitType } from "./weapons";
import { getDirections, terrainFeatures } from "./mapdata";
import { map } from "./main";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

// Groups of infantry, tanks, etc.
abstract class AgentCollection<T extends Unit> implements Entity {
	public readonly id: string;
	public abstract readonly type: UnitType;
	protected _team: Team = Team.None;
	public get team(): Team { return this._team }

	public waypoints: Waypoint[];
	public intermediatePoints: Vector2[];
	private navigationCalculated: boolean = false;
	private navigating : boolean = false;

	public units: T[];

	private sources: Map<string, { id: string, source: mapboxgl.GeoJSONSource }> = new Map();
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

	constructor(id: string, team: Team, units: T[], waypoints: Waypoint[]) {
		this.id = id.replace(/ /g, "_");
		this._team = team;
		this.units = units;
		this.waypoints = waypoints;
		this.intermediatePoints = [this.location, this.location];

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
		
		// terrainFeatures(this.location).then(terrain => {
		// 	console.log(terrain.terrain, terrain.elevation);
		// });
	}

	// Navigation occurs on the unit collection level and instructions get
	// propogated downwards to the individual units
	private async calculateNavigation(): Promise<void> {
		if (this.waypoints.length <= 0) {
			return;
		}
		
		let next = this.waypoints[0];
		this.intermediatePoints = await getDirections(this.location, next.location, this.type);
		this.sources.get("path")!.source.setData(turf.lineString(this.intermediatePoints));

		this.navigationCalculated = true;
	}

	public tick(time: number, secondsElapsed: number): void {
		if (this.waypoints[0] && turf.distance(this.waypoints[0].location, this.location) < NAVIGATION_THRESHOLD) {
			// Destination reached
			if (time >= this.waypoints[0].time.valueOf() / 1000) {
				// Only advance to next waypoint when time matches up
				this.waypoints.shift();
				this.navigationCalculated = false;
				this.navigating = false;
				if (this.waypoints.length === 0) {
					console.log(`${this.id} is done with navigation!`);
					// Hide intermediate points path
					map.setLayoutProperty(this.sources.get("path")!.id, "visibility", "none");
				}
				else {
					console.log(`${this.id} moving to next objective. ${this.waypoints.length - 1} remaining.`);
				}
			}
		}
		if (!this.navigating && !this.navigationCalculated) {
			this.calculateNavigation();
		}
		else if (!this.navigating && this.navigationCalculated) {
			for (let unit of this.units) {
				unit.updatePath(time, this.intermediatePoints, this.waypoints[0]);
			}
			this.navigating = true;
		}
		// Tick through subunits
		for (let unit of this.units) {
			if (this.navigating) {
				unit.navigate(time);
			}
			unit.tick(secondsElapsed);
		}
		// Update location on map
		this.sources.get("location")!.source.setData(turf.point(this.location));
	}

	private drawInit(): void {
		// Add sources
		type SourceGeoJSON = _turf.helpers.Feature<_turf.helpers.Point, _turf.helpers.Properties> | _turf.helpers.Feature<_turf.helpers.LineString, _turf.helpers.Properties>;
		let data: [string, SourceGeoJSON][] = [
			["location", turf.point(this.location)],
			["path", turf.lineString(this.intermediatePoints)],
			["waypoints", turf.lineString([this.location, ...this.waypoints.map(waypoint => waypoint.location)])]
		];
		for (let [id, geojson] of data) {
			let sourceID = `${this.id}_${id}`;
			map.addSource(sourceID, {
				type: "geojson",
				data: geojson
			});
			this.sources.set(id, {
				id: sourceID,
				source: map.getSource(sourceID) as mapboxgl.GeoJSONSource
			});
		}

		// HTML controls for data visualization
		const showWaypoints = document.getElementById("show-waypoints") as HTMLInputElement;
		showWaypoints.addEventListener("change", () => {
			if (showWaypoints.checked) {
				map.setLayoutProperty(this.sources.get("waypoints")!.id, "visibility", "visible");
			}
			else {
				map.setLayoutProperty(this.sources.get("waypoints")!.id, "visibility", "none");
			}
		});
		
		map.addLayer({
			"id": this.sources.get("location")!.id,
			"source": this.sources.get("location")!.id,
			"type": "circle",
			"paint": {
				"circle-radius": 10,
				"circle-color": this.color
			}
		});
		map.addLayer({
			"id": this.sources.get("path")!.id,
			"source": this.sources.get("path")!.id,
			"type": "line",
			"layout": {
				"line-join": "round",
				"line-cap": "round",
			},
			// "minzoom": 11,
			"paint": {
				"line-color": this.color,
				"line-width": 6,
				"line-opacity": 0.9
			}
		});
		map.addLayer({
			"id": this.sources.get("waypoints")!.id,
			"source": this.sources.get("waypoints")!.id,
			"type": "line",
			"layout": {
				"line-join": "round",
				"line-cap": "round"
			},
			"paint": {
				"line-color": this.color,
				"line-width": 2,
				"line-opacity": 0.9
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
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let units: InfantrySquad[] = [];
		for (let i = 0; i < unitNumber; i++) {
			units.push(new InfantrySquad(location));
		}

		let id = `InfantryBattalion_${Team[team]}_${name}`;
		super(id, team, units, waypoints);

		this.type = UnitType.Infantry;
	}
}

export class TankBattalion extends AgentCollection<TankT55> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let units: TankT55[] = [];
		for (let i = 0; i < unitNumber; i++) {
			units.push(new TankT55(location));
		}

		let id = `InfantryBattalion_${Team[team]}_${name}`;
		super(id, team, units, waypoints);

		this.type = UnitType.HeavyArmor;
	}
}
