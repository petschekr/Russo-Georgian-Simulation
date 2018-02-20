// import * as geojson from "geojson";
import { Vector2, Utilities } from "./common";

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