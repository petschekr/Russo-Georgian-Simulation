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
	return `/directions/${mode}/${overview}/${coordinates}`;
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

	let compiledPoints = reducedPoints.map(point => point.join(",")).join(";");
	try {
		return await (await fetch(`/terrain/${compiledPoints}`)).json();
	}
	catch (err) {
		throw err;
	}
}
