import { Vector2 } from "./common";
import { UnitType } from "./weapons";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

export enum Mode {
	Driving,
	Walking
}

function directionsUrlFormatter(start: Vector2, end: Vector2, type: Mode = Mode.Driving, full: boolean = false): string {
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
class TerrainType {
	private state = {
		urban: true, // Lack of a Mapbox description = Empty space in the landcover layer represents either water or bare earth, rock, sand, and built-up areas
		wood: false, // The area is mostly wooded or forest-like
		scrub: false, // The area is either mostly bushy or a mix of wooded and grassy
		grass: false, // The area is mostly grassy
		crop: false, // The area is mostly agricultural, or thin/patchy grass
		snow: false // The area is mostly permanent ice, glacier or snow
	};
	get urban() {
		return this.state.urban;
	}
	get wood() {
		return this.state.wood;
	}
	enableWood() {
		this.state.urban = false;
		this.state.wood = true;
	}
	get scrub() {
		return this.state.wood;
	}
	enableScrub() {
		this.state.urban = false;
		this.state.scrub = true;
	}
	get grass() {
		return this.state.grass;
	}
	enableGrass() {
		this.state.urban = false;
		this.state.grass = true;
	}
	get crop() {
		return this.state.crop;
	}
	enableCrop() {
		this.state.urban = false;
		this.state.crop = true;
	}
	get snow() {
		return this.state.snow;
	}
	enableSnow() {
		this.state.urban = false;
		this.state.snow = true;
	}
}
export type TerrainReturn = { terrain: TerrainType; elevation: number };
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
				elevation
			});
		};
		xhr.onerror = err => {
			reject(err);
		};
		xhr.send();
	});
}
