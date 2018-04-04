import { UnitType } from "./weapons";
import { Unit } from "./units";
import { AgentCollection } from "./collections";
import { map, dispatcher, SouthOssetiaArea, TshkinvaliArea } from "./main";
import * as _turf from "@turf/turf";
declare const turf: typeof _turf;
declare const moment: any;

export type Vector2 = [number, number]; // Note! Longitude, Latitude (x, y)
export interface Waypoint {
	location: Vector2,
	temporary?: boolean
}

export interface Entity {
    readonly id: string;
	location: Vector2;
	
	tick(secondsElapsed: number): Promise<void>; // Do something every time iteration
}

export const NAVIGATION_THRESHOLD = 10; // 10 meters

export class Utilities {
	static randomFloat(max: number = 1): number {
		return Math.random() * max;
	}
	static randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	static degreesToRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}
	static radiansToDegrees(radians: number): number {
		return radians * (180 / Math.PI);
	}
	static pointToVector(point: _turf.Feature<_turf.Point, _turf.Properties>): Vector2 {
		return turf.getCoord(point) as Vector2;
	}
	static isEnemy(me: Team, them: Team): boolean {
		if (me === Team.Georgia && them === Team.Russia) {
			return true;
		}
		if (me === Team.Russia && them === Team.Georgia) {
			return true;
		}
		if (me === Team.Georgia && them === Team.SouthOssetia) {
			return true;
		}
		if (me === Team.SouthOssetia && them === Team.Georgia) {
			return true;
		}
		return false;
	}
	static fastDistance(location1: Vector2, location2: Vector2): number { // Returns in meters
		return turf.distance(location1, location2, { units: "meters" });
	}
	static pointOnLine(point: Vector2, line: _turf.Feature<_turf.LineString>): boolean {
		let lastDistance = Infinity;
		
		function getCoord (i: number): Vector2 {
			return line.geometry!.coordinates[i] as Vector2;
		};

		for (let i = 0; i < line.geometry!.coordinates.length - 1; i++) {
			let distanceDirect = Utilities.fastDistance(getCoord(i), getCoord(i + 1));
			let distanceViaCurrentLocation = Utilities.fastDistance(point, getCoord(i)) + Utilities.fastDistance(point, getCoord(i + 1));
			if (Math.abs(distanceDirect - distanceViaCurrentLocation) < 1) { // threshold: 1 meter
				return true;
			}
			// if (distanceViaCurrentLocation > lastDistance && Math.abs(distanceViaCurrentLocation - lastDistance) > 5) {
			// 	return false;
			// }
			lastDistance = distanceViaCurrentLocation;
		}
		return false;
	}
	static weaponAtRangeScale(distance: number, range: number): number {
		if (distance > range) return 0;
		// Linear scale from 1 (at 0 distance) to 0.5 (at max distance)
		return ((-1 + 0.5) / range) * distance + 1;
	}
}

// >"Team"
export enum Team {
	Russia, Georgia, SouthOssetia
}

export interface HoverInfo {
	name: string;
	team: string;
	color: string;
	health: number;
	terrain: string;
	slope: number;
	speed: number;
}

export class Dispatcher {
	private tickCount: number = 0;
	private readonly secondsPerTick: number = 60 * 1; // 1 minute elapses per tick

	private time: Date;
	get formattedTime(): string {
		return moment(this.time).utc().format("DD MMM YY HHmm[Z]") + ` (T ${this.tickCount.toLocaleString()})`;
	}

	public entities: Entity[];
	
	constructor(start: Date, entities: Entity[]) {
		// Clone don't copy the start date object
		this.time = new Date(start.valueOf());
		this.entities = entities;

		this.layerData = new Map();
		for (let team of [Team.Russia, Team.Georgia, Team.SouthOssetia]) {
			this.layerData.set(team, {
				location: new Map<string, _turf.Feature<_turf.Point>>(),
				path: new Map<string, _turf.Feature<_turf.LineString>>(),
				waypoints: new Map<string, _turf.Feature<_turf.LineString>>(),
				units: new Map<string, _turf.Feature<_turf.MultiPoint>>(),
				visibility: new Map<string, _turf.Feature<_turf.Polygon>>(),
			});
		}
		this.setupLayers();
		this.paint();
		
		window.addEventListener("mousemove", e => {
			if (this.hoverInfo.length > 0) {
				this.hoverInfoBox.style.top = `${e.pageY + 15}px`;
				this.hoverInfoBox.style.left = `${e.pageX + 15}px`;
			}
		});
	}

	public addEntities(entities: Entity | Entity[]): void {
		this.entities = this.entities.concat(entities);
	}
	public removeEntity(entityID: string): Entity | null {
		let removeIndex = this.entities.findIndex(entity => entity.id === entityID);
		if (removeIndex === -1) {
			return null;
		}
		return this.entities.splice(removeIndex, 1)[0];
	}

	private hoverInfo: HoverInfo[] = [];
	private hoverInfoBox = document.getElementById("hover-info")!;
	private hoverInfoCompiled: string = "";
	private updateInfoCompiled(): void {
		this.hoverInfoCompiled = "";

		if (this.hoverInfo.length === 0) {
			this.hoverInfoBox.style.display = "none";
			return;
		}
		
		for (let [i, info] of this.hoverInfo.entries()) {
			this.hoverInfoCompiled += `
			<strong style="font-size: 80%;">${info.name}</strong>
			<br />
			<span style="color: ${info.color}">${info.team}</span> | H: ${info.health.toFixed(0)} | T: ${info.terrain} | S: ${info.slope.toFixed(2)} | S: ${info.speed.toFixed(1)} m/s
			`;
			if (i !== this.hoverInfo.length - 1) {
				this.hoverInfoCompiled += "<hr />"
			}
		}
		this.hoverInfoBox.innerHTML = this.hoverInfoCompiled;
		this.hoverInfoBox.style.display = "block";
	}
	public addInfo(info: HoverInfo): void {
		if (info.color.toLowerCase() === "#ffffff") {
			info.color = "#000000"; // Text will be unreadable otherwise
		}
		let existingIndex = this.hoverInfo.findIndex(existingInfo => existingInfo.name === info.name);
		if (existingIndex === -1) {
			this.hoverInfo.push(info);
			// Sort alphabetically
			this.hoverInfo = this.hoverInfo.sort((a, b) => {
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
				return 0;
			});
		}
		else {
			this.hoverInfo[existingIndex] = info;
		}
		this.updateInfoCompiled();
	}
	public removeInfo(name: string): boolean {
		let index = this.hoverInfo.findIndex(info => info.name === name);
		if (index === -1) {
			return false;
		}
		this.hoverInfo.splice(index, 1);
		this.updateInfoCompiled();
		return true;
	}

	public get layerIDs(): string[] {
		let ids: string[] = [];
		for (let [team, layers] of this.layerData.entries()) {
			ids = ids.concat(Object.keys(layers).map(layer => `${team}_${layer}`));
		}
		return ids;
	}

	private detectedCollections = new Map<Team, Set<AgentCollection<Unit>>>();
	public updateDetectedCollections(team: Team, detected: Set<AgentCollection<Unit>>): void {
		let existingSet = this.detectedCollections.get(team);
		if (existingSet) {
			// Merge the two sets
			detected = new Set(function*() {
				yield* existingSet;
				yield* detected;
			}());
		}
		this.detectedCollections.set(team, detected);
	}
	public getDetectedCollections(team: Team): Set<AgentCollection<Unit>> {
		if (!this.detectedCollections.has(team)) {
			this.detectedCollections.set(team, new Set());
		}
		return this.detectedCollections.get(team)!;
	}

	public layerData: Map<Team, {
		location: Map<string, _turf.Feature<_turf.Point>>;
		path: Map<string, _turf.Feature<_turf.LineString>>;
		waypoints: Map<string, _turf.Feature<_turf.LineString>>;
		units: Map<string, _turf.Feature<_turf.MultiPoint>>;
		visibility: Map<string, _turf.Feature<_turf.Polygon>>;
	}>;
	public colorForTeam(team: Team): string {
		switch (team) {
			case Team.Russia:
				return "#FF4136";
			case Team.Georgia:
				return "#0074D9";
			case Team.SouthOssetia:
				return "#FFDC00";
			default:
				return "#FFFFFF"
		}
	}
	private setupLayers() {
		// Add sources
		for (let [team, layers] of this.layerData.entries()) {
			for (let key of Object.keys(layers)) {
				map.addSource(`${team}_${key}`, {
					type: "geojson",
					data: turf.point([0, 0])
				});
			}
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
				const visibility = control.checked ? "visible" : "none";
				for (let team of this.layerData.keys()) {
					map.setLayoutProperty(`${team}_${layerID}`, "visibility", visibility);
				}
			})
		}
		
		for (let team of this.layerData.keys()) {
			let color = this.colorForTeam(team);

			map.addLayer({
				"id": `${team}_waypoints`,
				"source": `${team}_waypoints`,
				"type": "line",
				"layout": {
					"line-join": "round",
					"line-cap": "round"
				},
				"paint": {
					"line-color": color,
					"line-width": 2,
					"line-opacity": 0.9
				}
			});
			map.addLayer({
				"id": `${team}_visibility`,
				"source": `${team}_visibility`,
				"type": "fill",
				"paint": {
					"fill-color": color,
					"fill-opacity": 0.5
				}
			});
			map.addLayer({
				"id": `${team}_location`,
				"source": `${team}_location`,
				"type": "circle",
				"paint": {
					"circle-radius": 10,
					"circle-color": color
				}
			});
			map.addLayer({
				"id": `${team}_path`,
				"source": `${team}_path`,
				"type": "line",
				"layout": {
					"line-join": "round",
					"line-cap": "round",
				},
				// "minzoom": 11,
				"paint": {
					"line-color": color,
					"line-width": 6,
					"line-opacity": 0.9
				}
			});
			map.addLayer({
				"id": `${team}_units`,
				"source": `${team}_units`,
				"type": "circle",
				"paint": {
					"circle-radius": 4,
					"circle-color": "#111",
					"circle-stroke-width": 2,
					"circle-stroke-color": "#FFFFFF"
				}
			});
			
		}
		
		// Attach event handlers for unit details
		function processMouseMove(e: any): void {
			let position: Vector2 = [e.lngLat.lng, e.lngLat.lat];
			for (let collection of dispatcher.entities) {
				if (!(collection instanceof AgentCollection)) continue;

				if (Utilities.fastDistance(position, collection.location) <= (!collection.eliminated ? collection.maxVisibilityRange : 200)) {
					dispatcher.addInfo({
						name: collection.id,
						color: dispatcher.colorForTeam(collection.team),
						team: Team[collection.team],
						health: collection.health,
						terrain: collection._currentTerrain.length > 0 ? collection._currentTerrain[0].type : "N/A",
						slope: collection._currentGrade,
						speed: collection._currentSpeed,
					});
				}
				else {
					dispatcher.removeInfo(collection.id);
				}
			}
		}
		map.on("mousemove", processMouseMove);

		for (let collection of this.entities) {
			if (!(collection instanceof AgentCollection)) continue;
			// Set some initial visualization data
			this.layerData.get(collection.team)!.location.set(
				collection.id,
				turf.point(collection.location)
			);
			this.layerData.get(collection.team)!.waypoints.set(
				collection.id,
				turf.lineString([collection.location, ...collection.waypoints.map(waypoint => waypoint.location)])
			);
			this.layerData.get(collection.team)!.units.set(
				collection.id,
				turf.multiPoint(collection.units.map(unit => unit.location))
			);
			this.layerData.get(collection.team)!.visibility.set(
				collection.id,
				turf.circle(collection.location, collection.maxVisibilityRange, { units: "meters" })
			);
		}
	}
	public paint() {
		for (let [team, layers] of this.layerData.entries()) {
			for (let key of Object.keys(layers) as (keyof typeof layers)[]) {
				let source = map.getSource(`${team}_${key}`) as mapboxgl.GeoJSONSource;
				// Assemble data
				let data: _turf.Feature<_turf.Point | _turf.MultiPoint | _turf.LineString | _turf.Polygon>[] = [];
				for (let value of this.layerData.get(team)![key].values()) {
					data.push(value);
				}
				source.setData(turf.combine(turf.featureCollection(data)));
			}
		}
	}

	private unitsEngaged = {
		georgiansInCity: 0,
		southOssetiansInCity: 0,
		georgiansInRegion: 0,
		russiansInRegion: 0,
	};
	private completedObjectives = {
		[Team.Georgia]: false,
		[Team.Russia]: false,
		[Team.SouthOssetia]: false,
	};
	private readonly output = document.getElementById("output") as HTMLTextAreaElement;
	private readonly tickProgress = document.getElementById("tick-progress") as HTMLParagraphElement;
	public finished = false;
	public async tick(): Promise<void> {
		this.time.setSeconds(this.time.getSeconds() + this.secondsPerTick);

		this.unitsEngaged.georgiansInCity = 0;
		this.unitsEngaged.southOssetiansInCity = 0;
		this.unitsEngaged.georgiansInRegion = 0;
		this.unitsEngaged.russiansInRegion = 0;
		let unitsFinished = 0;
		for (let [i, entity] of this.entities.entries()) {
			await entity.tick(this.secondsPerTick);

			// Check terminal conditions
			if (entity instanceof AgentCollection) {
				if (entity.eliminated || entity.waypoints.length === 0) {
					unitsFinished++;
				}
				if (!entity.eliminated) {
					if (entity.team === Team.Georgia) {
						if (turf.booleanPointInPolygon(entity.location, TshkinvaliArea)) {
							this.unitsEngaged.georgiansInCity++;
							this.unitsEngaged.georgiansInRegion++; // Implied
						}
						else if (turf.booleanPointInPolygon(entity.location, SouthOssetiaArea)) {
							this.unitsEngaged.georgiansInRegion++;
						}
					}
					else if (entity.team === Team.Russia && turf.booleanPointInPolygon(entity.location, SouthOssetiaArea)) {
						this.unitsEngaged.russiansInRegion++;
					}
					else if (entity.team === Team.SouthOssetia && turf.booleanPointInPolygon(entity.location, TshkinvaliArea)) {
						this.unitsEngaged.southOssetiansInCity++;
					}
				}
			}

			if (this.tickCount === 0) {
				this.tickProgress.textContent = `${i} / ${this.entities.length.toLocaleString()} subticks processed`;
			}
		}
		if (this.tickCount > 0) {
			this.tickProgress.textContent = `${unitsFinished.toLocaleString()} / ${this.entities.length.toLocaleString()} units finished`;
		}
		if (unitsFinished === this.entities.length) {
			let damage = {
				[Team.Georgia]: { eliminated: 0, casualties: 0 },
				[Team.Russia]: { eliminated: 0, casualties: 0 },
				[Team.SouthOssetia]: { eliminated: 0, casualties: 0 },
			};
			for (let collection of this.entities) {
				if (!(collection instanceof AgentCollection)) continue;
				if (collection.eliminated) {
					damage[collection.team].eliminated++;
					damage[collection.team].casualties += collection.crew * collection.maxUnitNumber;
				}
				else {
					let totalNumber = collection.crew * collection.maxUnitNumber;
					damage[collection.team].casualties += totalNumber - Math.ceil(totalNumber * (collection.health / collection.maxHealth));
				}
			}
			this.output.value += `
Simulation finished at tick ${this.tickCount}.
(Collections destroyed / Casualties sustained)
Georgia: (${damage[Team.Georgia].eliminated} / ${damage[Team.Georgia].casualties.toLocaleString()})
Russia: (${damage[Team.Russia].eliminated} / ${damage[Team.Russia].casualties.toLocaleString()})
S. Ossetia: (${damage[Team.SouthOssetia].eliminated} / ${damage[Team.SouthOssetia].casualties.toLocaleString()})`;

			this.finished = true;
		}

		if (this.unitsEngaged.georgiansInCity === 0) {
			if (!this.completedObjectives[Team.SouthOssetia]) {
				this.output.value += `Tick ${this.tickCount}: South Ossetian objective completed\n`;
				this.completedObjectives[Team.SouthOssetia] = true;
			}
		}
		else {
			this.completedObjectives[Team.SouthOssetia] = false;
		}
		
		if (this.unitsEngaged.georgiansInRegion === 0) {
			if (!this.completedObjectives[Team.Russia]) {
				this.output.value += `Tick ${this.tickCount}: Russian objective completed\n`;
				this.completedObjectives[Team.Russia] = true;
			}
		}
		else {
			this.completedObjectives[Team.Russia] = false;
		}
		
		if (this.unitsEngaged.russiansInRegion === 0) {
			if (!this.completedObjectives[Team.Georgia]) {
				this.output.value += `Tick ${this.tickCount}: Georgian objective completed\n`;
				this.completedObjectives[Team.Georgia] = true;
			}
		}
		else {
			this.completedObjectives[Team.Georgia] = false;
		}
		
		// Could be moved up into for loop if you want to see visualization after each collection tick
		this.paint();

		this.tickCount++;
	}
}
