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
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 15, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] }
		], "41st Battalion", Team.Georgia),
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 15, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] }
		], "42nd Battalion", Team.Georgia),
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 15, [
			{ location: [43.77322196960449, 42.19406111275616] }
		], "43rd Battalion", Team.Georgia),
		new TankBattalion([43.952436447143555, 42.20022901694891], 20, [
		], "44th Armored Battalion", Team.Georgia),
		
		new InfantryBattalion([44.03217315673828, 42.21046513733562], 15, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "31st Battalion", Team.Georgia),
		new InfantryBattalion([44.03217315673828, 42.21046513733562], 15, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "32nd Battalion", Team.Georgia),
		new InfantryBattalion([44.03217315673828, 42.21046513733562], 15, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "33rd Battalion", Team.Georgia),
		new TankBattalion([44.03217315673828, 42.21046513733562], 20, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "34th Armored Battalion", Team.Georgia),
		
		/**Reserve**/
		new InfantryBattalion([43.99955749511719, 42.15335057390396], 15, [
		], "53rd Battalion", Team.Georgia),
		new InfantryBattalion([43.99526596069336, 42.196095951813454], 15, [
		], "11th Battalion", Team.Georgia),
		new TankBattalion([43.96385192871094, 42.163594285679395], 20, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Independent Tank Battalion", Team.Georgia),
		new InfantryBattalion([44.03672218322754, 42.177080370547195], 15, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Independent Infantry Battalion", Team.Georgia),
		
		/**Far West**/
		new InfantryBattalion([43.597354888916016, 42.5045977676146], 15, [
			{ location: [43.631858825683594,  42.509817850023786] }
		], "Combined Battalion", Team.Georgia),
		new InfantryBattalion([43.59769821166992, 42.36133451106724], 15, [
		], "Mountain Rifle Battalion", Team.Georgia),
		
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
