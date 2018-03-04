import { Vector2 } from "./common";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

export enum Mode {
	Driving,
	Walking
}

function urlFormatter(start: Vector2, end: Vector2, type: Mode = Mode.Driving, full: boolean = true): string {
	let coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
	let mode = type === Mode.Walking ? "walking" : "driving";
	let overview = full ? "full" : "simplified";
	return `https://api.mapbox.com/directions/v5/mapbox/${mode}/${encodeURIComponent(coordinates)}.json?access_token=${mapboxgl.accessToken}&geometries=geojson&overview=${overview}`;
}
export async function getDirections(start: Vector2, end: Vector2): Promise<Vector2[]> {
	return new Promise<Vector2[]>((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", urlFormatter(start, end), true);
		xhr.responseType = "json";
		xhr.onload = () => {
			resolve(xhr.response.routes[0].geometry.coordinates);
		};
		xhr.onerror = err => {
			reject(err);
		};
		xhr.send();
	});
}
