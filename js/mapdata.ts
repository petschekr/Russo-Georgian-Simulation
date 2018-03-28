import { Vector2, Utilities } from "./common";
import { UnitType } from "./weapons";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

export enum Mode {
	Driving,
	Walking
}

function directionsUrlFormatter(start: Vector2, end: Vector2, type: Mode = Mode.Driving, full: boolean = true): string {
	let coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
	let mode = type === Mode.Walking ? "walking" : "driving";
	let overview = full ? "full" : "simplified";
	return `https://api.mapbox.com/directions/v5/mapbox/${mode}/${encodeURIComponent(coordinates)}.json?access_token=${mapboxgl.accessToken}&geometries=geojson&overview=${overview}`;
}

export async function getDirections(start: Vector2, end: Vector2, unitType: UnitType): Promise<Vector2[]> {
	let movementMode: Mode;
	if (unitType === UnitType.Infantry || unitType === UnitType.None) {
		movementMode = Mode.Walking;
	}
	else {
		movementMode = Mode.Driving;
	}

	return new Promise<Vector2[]>((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", directionsUrlFormatter(start, end, movementMode), true);
		xhr.responseType = "json";
		xhr.onload = () => {
			if (xhr.status === 429) {
				// Too many request -- wait a bit
				console.warn("Too many requests made to Mapbox! Waiting before retrying");
				window.setTimeout(async () => {
					try {
						resolve(await getDirections(start, end, unitType));
					}
					catch (err) {
						reject(err);
					}
				}, 2000);
				return;
			}
			resolve([
				...xhr.response.routes[0].geometry.coordinates,
				end // Mapbox sometimes simplifies directions and leaves out actual desired destination
			]);
		};
		xhr.onerror = err => {
			reject(err);
		};
		xhr.send();
	});
}

// https://www.mapbox.com/vector-tiles/mapbox-terrain/#landcover
enum Type {
	Urban = 0x1,
	Wood = 0x2,
	Scrub = 0x4,
	Grass = 0x8,
	Crop = 0x10,
	Snow = 0x20
}
export class TerrainType {
	private state = Type.Urban;
	get urban() {
		return !!(this.state & Type.Urban);
	}
	get wood() {
		return !!(this.state & Type.Wood);
	}
	enableWood() {
		this.state = Type.Wood;
	}
	get scrub() {
		return !!(this.state & Type.Scrub);
	}
	enableScrub() {
		this.state = Type.Scrub;
	}
	get grass() {
		return !!(this.state & Type.Grass);
	}
	enableGrass() {
		this.state = Type.Grass;
	}
	get crop() {
		return !!(this.state & Type.Crop);
	}
	enableCrop() {
		this.state = Type.Crop;
	}
	get snow() {
		return !!(this.state & Type.Snow);
	}
	enableSnow() {
		this.state = Type.Snow;
	}

	public toString(): string {
		if (this.state & Type.Urban) {
			return "urban";
		}
		if (this.state & Type.Wood) {
			return "wood";
		}
		if (this.state & Type.Scrub) {
			return "scrub";
		}
		if (this.state & Type.Grass) {
			return "grass";
		}
		if (this.state & Type.Crop) {
			return "crop";
		}
		if (this.state & Type.Snow) {
			return "snow";
		}
		return "N/A";
	}
}
export type TerrainReturn = { terrain: TerrainType; elevation: number | null };
export async function terrainFeatures(location: Vector2): Promise<TerrainReturn> {
	return new Promise<TerrainReturn>((resolve, reject) => {
		let url = `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${location[0]},${location[1]}.json?radius=0&access_token=${mapboxgl.accessToken}`;
		let xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.responseType = "json";
		xhr.onload = () => {
			let featureCollection: _turf.FeatureCollection = xhr.response;
			let terrain: TerrainType = new TerrainType();
			let elevation = -Infinity;

			for (let feature of featureCollection.features) {
				if (!feature.properties) {
					continue;
				}
				if (feature.properties.class) {
					switch (feature.properties.class) {
						case "wood":
							terrain.enableWood();
							break;
						case "scrub":
							terrain.enableScrub();
							break;
						case "grass":
							terrain.enableGrass();
							break;
						case "crop":
							terrain.enableCrop();
							break;
						case "snow":
							terrain.enableSnow();
							break;
					}
				}
				// Find maximum of elevation polygons returned
				// In the Mapbox Terrain tileset, contours are comprised of stacked polygons, which means most of your requests will return multiple features from the contour layer. You will likely need to parse the returned GeoJSON to find the highest elevation value.
				// https://www.mapbox.com/help/access-elevation-data/
				if (feature.properties.ele && feature.properties.ele > elevation) {
					elevation = feature.properties.ele;
				}
			}

			resolve({
				terrain,
				elevation: elevation !== -Infinity ? elevation : null
			});
		};
		xhr.onerror = err => {
			reject(err);
		};
		xhr.send();
	});
}

type LineString = _turf.helpers.Feature<_turf.LineString, _turf.helpers.Properties>;
export async function terrainAlongLine(line: LineString, sample: number = 1000 /* meters */): Promise<TerrainReturn[]> { 
	let length = turf.length(line, { units: "meters" });
	let reducedPointCount = Math.ceil(length / sample) + 1;
	let reducedPoints: Vector2[] = [];
	for (let i = 0; i < reducedPointCount; i++) {
		reducedPoints.push(Utilities.pointToVector(turf.along(line, i * sample, { units: "meters" })));
	}

	return Promise.all(reducedPoints.map(point => terrainFeatures(point)));
}
