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
	return `/russo-georgia/directions/${mode}/${overview}/${coordinates}`;
}

export async function getDirections(start: Vector2, end: Vector2, unitType: UnitType): Promise<Vector2[]> {
	let movementMode: Mode;
	if (unitType === UnitType.Infantry || unitType === UnitType.None) {
		movementMode = Mode.Walking;
	}
	else {
		movementMode = Mode.Driving;
	}

	return (await fetch(directionsUrlFormatter(start, end, movementMode))).json();
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

	const chunkSize = 150; // Something has stability issues with URLs too large when running in production
	let data: any[] = [];
	for (let i = 0; i < reducedPoints.length; i += chunkSize) {
		let compiledPoints = reducedPoints.slice(i, i + chunkSize).map(point => point.join(",")).join(";");
		data = data.concat(await (await fetch(`/russo-georgia/terrain/${compiledPoints}`)).json());
	}
	return data;
}
