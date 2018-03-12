import { Vector2, Waypoint, Entity, Team, NAVIGATION_THRESHOLD, Utilities } from "./common";
import { Unit, TankT55, InfantrySquad } from "./units";
import { UnitType } from "./weapons";
import { getDirections, terrainFeatures, TerrainReturn } from "./mapdata";
import { map } from "./main";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

type GeoFeature<T> = _turf.helpers.Feature<T, _turf.helpers.Properties>;

// Groups of infantry, tanks, etc.
abstract class AgentCollection<T extends Unit> implements Entity {
	private static instances: AgentCollection<Unit>[] = [];

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

	private visibilityArea: GeoFeature<_turf.helpers.Polygon | _turf.helpers.MultiPolygon> = turf.polygon([[[0, 0], [0, 0], [0, 0], [0, 0]]]);

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
		AgentCollection.instances.push(this);
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
	}

	// Navigation occurs on the unit collection level and instructions get
	// propogated downwards to the individual units
	private navigationCalculating: boolean = false;
	private async calculateNavigation(): Promise<void> {
		if (this.waypoints.length <= 0) {
			return;
		}
		if (this.navigationCalculating) {
			return;
		}
		this.navigationCalculating = true;
		
		let next = this.waypoints[0];
		this.intermediatePoints = await getDirections(this.location, next.location, this.type);
		let intermediatePath = turf.lineString(this.intermediatePoints);
		// Don't take really inefficient paths
		const inefficientPathFactor = 2.5;
		if (turf.length(intermediatePath) > turf.distance(this.location, next.location) * inefficientPathFactor) {
			this.intermediatePoints = [this.location, next.location];
			intermediatePath = turf.lineString(this.intermediatePoints);
		}

		this.sources.get("path")!.source.setData(intermediatePath);

		// let chunks = turf.lineChunk(intermediatePath, 1, { units: "kilometers" });
		// let chunks2 = chunks.features[0];
		let allCoords = turf.coordAll(intermediatePath);
		let start = allCoords[0] as Vector2;
		let end = allCoords[allCoords.length - 1] as Vector2;
		let distance = turf.distance(start, end, { units: "meters" });

		let terrainDetails = await Promise.all([
			terrainFeatures(start),
			terrainFeatures(end)
		]);
		
		// Rise / run
		let grade = Math.abs(terrainDetails[1].elevation - terrainDetails[0].elevation) / distance;
		console.log(`Calculated grade for computed route (${terrainDetails[1].elevation - terrainDetails[0].elevation} / ${distance}):`, grade);
		for (let unit of this.units) {
			unit.setSpeedForGrade(grade);
		}

		this.navigationCalculating = false;
		this.navigationCalculated = true;
	}

	private unitsFinishedNavigating: boolean = false;
	private combatCalculationFinished: boolean = true;
	public tick(time: number, secondsElapsed: number): void {
		if (this.waypoints[0] && this.unitsFinishedNavigating) {
			// Destination reached (all units no longer traveling)
			this.waypoints.shift();
			this.unitsFinishedNavigating = false;
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
		let finishedNavigation = 0;
		let unitVisibilties: GeoFeature<_turf.helpers.Polygon>[] = [];
		for (let unit of this.units) {
			if (this.navigating && unit.navigate(time)) {
				finishedNavigation++;
			}
			//unitVisibilties.push(turf.circle(unit.location, unit.visibility.range, { units: "meters" }));
			unit.tick(secondsElapsed);
		}
		this.unitsFinishedNavigating = this.units.length === finishedNavigation;
		// Disabled for performance concerns
		//this.visibilityArea = turf.union(...unitVisibilties);
		this.visibilityArea = turf.circle(this.location, this.units[0].visibility.range, { units: "meters" });

		if (this.combatCalculationFinished) {
			this.combatCalculationFinished = false;
			this.combat().then(() => this.combatCalculationFinished = true);
		}

		// Update visualizations on map
		this.sources.get("location")!.source.setData(turf.point(this.location));
		this.sources.get("units")!.source.setData(turf.multiPoint(this.units.map(unit => unit.location)));
		this.sources.get("visibility")!.source.setData(this.visibilityArea);
	}

	private detectedCollections = new Set<AgentCollection<Unit>>();
	private async combat(): Promise<void> {
		const visibilityRange = this.units[0].visibility.range;
		const detectionMultiplier = 1;

		let otherCollections = AgentCollection.instances.filter(instance => instance.id !== this.id);
		for (let collection of otherCollections) {
			if (
				turf.booleanPointInPolygon(collection.location, this.visibilityArea)
				&& Math.random() * (visibilityRange / turf.distance(this.location, collection.location, { units: "meters" })) * detectionMultiplier
			) {
				if (this.detectedCollections.has(collection)) {
					continue;
				}
				// Detected another unit
				if (this.type === UnitType.Infantry && collection.type === UnitType.HeavyArmor && this.units.length < collection.units.length * 3) {
					continue;
				}
				if (this.type === UnitType.HeavyArmor && collection.type === UnitType.Infantry && this.units.length < collection.units.length * 0.5) {
					continue;
				}
				this.detectedCollections.add(collection);
				console.log("Detected collection:", collection.id);
				// Move to most advantageous postion (highest ground)
				let bearing = Utilities.randomInt(0, 360);
				let bearings = [bearing, (bearing + 90) % 360, (bearing + 180) % 360, (bearing + 270) % 360];
				let elevations = await Promise.all(bearings.map(async bearing => {
					let location = turf.destination(collection.location, 200, bearing, { units: "meters" });
					let terrain = await terrainFeatures(turf.coordAll(location)[0] as Vector2);
					return {
						location,
						elevation: terrain.elevation
					};
				}));
				let maxElevation = -Infinity;
				let maxPoint = turf.point([0, 0]);
				for (let elevation of elevations) {
					if (elevation.elevation > maxElevation) {
						maxElevation = elevation.elevation;
						maxPoint = elevation.location;
					}
				}
				this.waypoints.unshift({ location: Utilities.pointToVector(maxPoint) });
				this.navigating = false;
				this.calculateNavigation();
			}
			else if (this.detectedCollections.has(collection)) {
				// Remove unseen unit
				this.detectedCollections.delete(collection);
			}
		}
	}

	private drawInit(): void {
		// Add sources
		type SourceGeoJSON = GeoFeature<_turf.helpers.Point>
			| GeoFeature<_turf.helpers.MultiPoint>
			| GeoFeature<_turf.helpers.LineString>
			| GeoFeature<_turf.helpers.Polygon | _turf.helpers.MultiPolygon>;

		let data: [string, SourceGeoJSON][] = [
			["location", turf.point(this.location)],
			["path", turf.lineString(this.intermediatePoints)],
			["waypoints", turf.lineString([this.location, ...this.waypoints.map(waypoint => waypoint.location)])],
			["units", turf.multiPoint(this.units.map(unit => unit.location))],
			["visibility", this.visibilityArea]
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
		let controlAndLayerIDs = new Map([
			["show-waypoints", "waypoints"],
			["show-collections", "location"],
			["show-units", "units"],
			["show-path", "path"],
			["show-visibility", "visibility"],
		]);
		for (let [controlID, layerID] of controlAndLayerIDs.entries()) {
			const control = document.getElementById(controlID) as HTMLInputElement;
			control.addEventListener("change", () => {
				if (control.checked) {
					map.setLayoutProperty(this.sources.get(layerID)!.id, "visibility", "visible");
				}
				else {
					map.setLayoutProperty(this.sources.get(layerID)!.id, "visibility", "none");
				}
			})
		}
		
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
		map.addLayer({
			"id": this.sources.get("visibility")!.id,
			"source": this.sources.get("visibility")!.id,
			"type": "fill",
			"paint": {
				"fill-color": this.color,
				"fill-opacity": 0.5
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
			"id": this.sources.get("units")!.id,
			"source": this.sources.get("units")!.id,
			"type": "circle",
			"paint": {
				"circle-radius": 4,
				"circle-color": this.color,
				"circle-stroke-width": 2,
				"circle-stroke-color": "#FFFFFF"
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

		let id = `TankBattalion_${Team[team]}_${name}`;
		super(id, team, units, waypoints);

		this.type = UnitType.HeavyArmor;
	}
}
