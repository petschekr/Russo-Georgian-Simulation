// import * as geojson from "geojson";
import { Vector2, Utilities, Team, Dispatcher, Entity } from "./common";
import { InfantrySquad, TankT55 } from "./units";
import { InfantryBattalion, TankBattalion } from "./collections";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

const MAPBOX_TOKEN = "pk.eyJ1IjoicGV0c2NoZWtyIiwiYSI6ImNqZHY0YWExZDBlM3ozM2xidWMyZnRwMjkifQ.b65yhhfYo08ptlaRmSungw";
mapboxgl.accessToken = MAPBOX_TOKEN;

export const map = new mapboxgl.Map({
    container: "map",
	style: "mapbox://styles/mapbox/outdoors-v9",
	center: [43.968468, 42.218956],
	zoom: 10,
	bearingSnap: 20
});

// Terrain types
// TODO: Implement as GeoJSON polygon NOT as entity
/*class GridTile implements Entity {
	public readonly id: string;
	public location: Vector2;

	constructor(location: Vector2) {
		this.location = location;
	}
}*/

function initializeUnits(): Entity[] {
	return [
		new InfantryBattalion([43.936281, 42.150163], 100, [
			{ location: [43.89000000, 42.20582778], time: new Date("2008-08-08T01:30:00+04:00") },
			{ location: [43.95472222, 42.22019722], time: new Date("2008-08-08T06:00:00+04:00") },
			{ location: [43.97388889, 42.18781389], time: new Date("2008-08-08T10:30:00+04:00") },
			{ location: [43.97305556, 42.22945556], time: new Date("2008-08-08T19:00:00+04:00") },
			{ location: [43.97388889, 42.18781389], time: new Date("2008-08-09T15:00:00+04:00") },
		], "41st Battalion", Team.Georgia),
		new TankBattalion([44.092997, 42.620822], 100, [
			{ location: [44.117457, 42.563961], time: new Date("2008-08-08T02:00:00+04:00") },
			{ location: [43.889027, 42.216375], time: new Date("2008-08-08T19:00:00+04:00") },
			{ location: [43.934524, 42.225263], time: new Date("2008-08-09T14:00:00+04:00") },
			{ location: [43.958148, 42.221903], time: new Date("2008-08-09T15:30:00+04:00") },
			{ location: [43.938932, 42.225042], time: new Date("2008-08-09T20:00:00+04:00") },
		], "135 Motorized Rifle Regiment", Team.Russia)
	];
}

map.on("load", () => start());

async function start() {
	const startDate = new Date("2008-08-08T00:00:00+04:00"); // August 8th, 2008 @ midnight
	const units = initializeUnits();
	const dispatcher = new Dispatcher(startDate, units);
	
	const timeElement = document.getElementById("time")!;
	timeElement.textContent = dispatcher.formattedTime;

	const stopButton = document.getElementById("stop")!;
	let shouldStop = true;
	stopButton.addEventListener("click", () => {
		shouldStop = !shouldStop;
		if (!shouldStop) {
			stopButton.textContent = "Stop";
			window.requestAnimationFrame(update);
		}
		else {
			stopButton.textContent = "Start";
		}
	});

	function update() {
		dispatcher.tick();
		timeElement.textContent = dispatcher.formattedTime;

		if (!shouldStop) {
			window.requestAnimationFrame(update);
		}
	}
}
