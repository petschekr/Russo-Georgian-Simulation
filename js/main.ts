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
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 5, [
			{ location: [43.89261245727539, 42.21211802], time: new Date("2008-08-08T01:30:00+04:00") },
			{ location: [43.95647048950195, 42.22178015985047], time: new Date("2008-08-08T06:00:00+04:00") },
			// Warning: BS arrival times below this
			{ location: [43.96831512451172, 42.2162023613838], time: new Date("2008-08-08T12:00:00+04:00") },
            { location: [43.97471219301224, 42.23230274125556], time: new Date("2008-08-08T12:00:00+04:00") },
            { location: [43.96300435066223, 42.22481516512234], time: new Date("2008-08-08T12:00:00+04:00") },
            { location: [43.969130516052246, 42.20904664356124], time: new Date("2008-08-08T12:00:00+04:00") }
		], "41st Battalion", Team.Georgia),
		new TankBattalion([44.09646, 42.62257], 5, [
			{ location: [44.117457, 42.563961], time: new Date("2008-08-08T02:00:00+04:00") },
			// CHECK TIMES
			{ location: [44.059123992919915, 42.452214646756104], time: new Date("2008-08-08T00:00:00+04:00") },
			{ location: [43.90325546264648, 42.349663931625585], time: new Date("2008-08-08T00:00:00+04:00") },
			{ location: [43.964388370513916, 42.246151422934474], time: new Date("2008-08-08T00:00:00+04:00") },
			{ location: [43.95110607147217, 42.237064933651965], time: new Date("2008-08-08T00:00:00+04:00") },
			{ location: [43.95110607147217, 42.237064933651965], time: new Date("2008-08-08T00:00:00+04:00") },
			{ location: [43.92630100250244, 42.23296605397935], time: new Date("2008-08-08T00:00:00+04:00") },
			{ location: [43.92630100250244, 42.23296605397935], time: new Date("2008-08-09T18:00:00+04:00") },
			{ location: [43.95838022232056, 42.22184372166598], time: new Date("2008-08-09T20:00:00+04:00") }
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
			update();
		}
		else {
			stopButton.textContent = "Start";
		}
	});

	const tickDelayBox = document.getElementById("tick-delay") as HTMLInputElement;
	let tickDelay = parseInt(tickDelayBox.value, 10);
	console.log("Delay set to:", tickDelay);
	tickDelayBox.addEventListener("change", () => {
		tickDelay = parseInt(tickDelayBox.value, 10);
		console.log("Delay updated to:", tickDelay);
	});

	async function update() {
		dispatcher.tick();
		timeElement.textContent = dispatcher.formattedTime;
		// console.timeEnd("Dispatcher tick");

		if (!shouldStop) {
			window.setTimeout(update, tickDelay);
			//window.requestAnimationFrame(update);
		}
	}
}

async function wait(milliseconds: number): Promise<void> {
	return new Promise<void>(resolve => {
		window.setTimeout(() => resolve(), milliseconds);
	});
}
