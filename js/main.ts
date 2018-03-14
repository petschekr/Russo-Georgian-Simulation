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
	zoom: 14,
	bearingSnap: 20
});

function initializeUnits(): Entity[] {
	return [
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 5, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] },
			{ location: [43.96831512451172, 42.2162023613838] },
            { location: [43.97471219301224, 42.23230274125556] },
            { location: [43.96300435066223, 42.22481516512234] },
			{ location: [43.969130516052246, 42.20904664356124] },
			{ location: [43.97483825683594, 42.203654487208524] }
		], "41st Battalion", Team.Georgia),
		new InfantryBattalion([43.97101879119873, 42.198162518171216], 5, [
			{ location: [43.95801544189453, 42.19724051999189] },
			  { location: [43.962392807006836, 42.211609445233606] },
			  { location: [43.964195251464844, 42.22870802111522] },
			  { location: [43.98024559020996, 42.22908934920094] },
			  { location: [43.97320747375488, 42.222670019444934] },
			  { location: [43.95647048950195, 42.221970845105055] },
			  { location: [43.95956039428711, 42.21059228368138] },
			  { location: [43.94951820373535, 42.2107830027201] }
		], "Test Battalion", Team.Georgia),
		new TankBattalion([44.09646, 42.62257], 10, [
			{ location: [44.117457, 42.563961] },
			{ location: [44.059123992919915, 42.452214646756104] },
			{ location: [43.90325546264648, 42.349663931625585] },
			{ location: [43.964388370513916, 42.246151422934474] },
			{ location: [43.95110607147217, 42.237064933651965] },
			{ location: [43.95110607147217, 42.237064933651965] },
			{ location: [43.92630100250244, 42.23296605397935] },
			{ location: [43.92630100250244, 42.23296605397935] },
			{ location: [43.95838022232056, 42.22184372166598] }
		], "135 Motorized Rifle Regiment", Team.Russia),
		new TankBattalion([44.07852172851562, 42.6304856356306], 10, [
			{ location: [44.117457, 42.563961] },
			{ location: [44.059123992919915, 42.452214646756104] },
			{ location: [43.90325546264648, 42.349663931625585] },
			{ location: [43.964388370513916, 42.246151422934474] },
			{ location: [43.95110607147217, 42.237064933651965] },
			{ location: [43.95110607147217, 42.237064933651965] },
			{ location: [43.92630100250244, 42.23296605397935] },
			{ location: [43.92630100250244, 42.23296605397935] },
			{ location: [43.95838022232056, 42.22184372166598] }
		], "Test Tank Battalion", Team.Russia)
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
		await dispatcher.tick();
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
