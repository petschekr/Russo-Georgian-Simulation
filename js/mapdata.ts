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
				}, 15000);
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
enum LandCoverEnum {
	"urban",
	"crop",
	"grass",
	"scrub",
	"wood",
}
export type LandCover = keyof typeof LandCoverEnum;
export type TerrainReturn = { location: Vector2; elevation: number; type: LandCover; };
type LineString = _turf.Feature<_turf.LineString, any>;

export async function terrainAlongLine(line: LineString, sample: number /* meters */): Promise<TerrainReturn[]> { 
	let length = turf.length(line, { units: "meters" });
	let reducedPointCount = Math.ceil(length / sample) + 1;
	let reducedPoints: Vector2[] = [];
	for (let i = 0; i < reducedPointCount; i++) {
		reducedPoints.push(Utilities.pointToVector(turf.along(line, i * sample, { units: "meters" })));
	}

	let compiledPoints = reducedPoints.map(point => point.join(",")).join(";");
	try {
		return await (await fetch(`/terrain/${compiledPoints}`)).json();
	}
	catch (err) {
		throw err;
	}
}
