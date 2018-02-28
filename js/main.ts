// import * as geojson from "geojson";
import { Vector2, Utilities, Team, Dispatcher, Entity } from "./common";
import { InfantrySquad, TankT55 } from "./units";
import { InfantryBattalion, TankBattalion } from "./collections";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

mapboxgl.accessToken = "pk.eyJ1IjoicGV0c2NoZWtyIiwiYSI6ImNqZHY0YWExZDBlM3ozM2xidWMyZnRwMjkifQ.b65yhhfYo08ptlaRmSungw";

const map = new mapboxgl.Map({
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
		new InfantryBattalion([42.15426111, 43.90888889], 1000, [
			{ location: [42.20582778, 43.89000000], time: new Date("2008-08-08T01:30:00+04:00") },
			{ location: [42.22019722, 43.95472222], time: new Date("2008-08-08T06:00:00+04:00") },
			{ location: [42.18781389, 43.97388889], time: new Date("2008-08-08T10:30:00+04:00") },
			{ location: [42.22945556, 43.97305556], time: new Date("2008-08-08T19:00:00+04:00") },
			{ location: [42.18781389, 43.97388889], time: new Date("2008-08-09T15:00:00+04:00") },
		], "41st Battalion", Team.Georgia),
		new TankBattalion([42.619582, 44.095052], 100, [
			{ location: [42.563961, 44.117457], time: new Date("2008-08-08T02:00:00+04:00") },
			{ location: [42.216375, 43.889027], time: new Date("2008-08-08T19:00:00+04:00") },
			{ location: [42.225263, 43.934524], time: new Date("2008-08-09T14:00:00+04:00") },
			{ location: [42.221903, 43.958148], time: new Date("2008-08-09T15:30:00+04:00") },
			{ location: [42.225042, 43.938932], time: new Date("2008-08-09T20:00:00+04:00") },
		], "135 Motorized Rifle Regiment", Team.Russia)
	];
}

map.on("load", () => start());

function start() {
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

	// TODO: make this dynamic!
    map.addSource("russia", {
        "type": "geojson",
        "data": turf.point(units[1].location)
	});
	map.addSource("georgia", {
        "type": "geojson",
        "data": turf.point(units[0].location)
    });

    map.addLayer({
        "id": "russia",
        "source": "russia",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#FF4136"
        }
	});
	map.addLayer({
        "id": "georgia",
        "source": "georgia",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#0074D9"
        }
    });

	function update() {
		dispatcher.tick();
		timeElement.textContent = dispatcher.formattedTime;

		(map.getSource("georgia") as mapboxgl.GeoJSONSource).setData(turf.point(dispatcher.entities[0].location));
		(map.getSource("russia") as mapboxgl.GeoJSONSource).setData(turf.point(dispatcher.entities[1].location));

		if (!shouldStop) {
			window.requestAnimationFrame(update);
		}
	}
}
