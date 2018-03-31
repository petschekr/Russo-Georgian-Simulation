import * as fs from "fs";
import * as express from "express";
import { default as fetch } from "node-fetch";
import pbf = require("pbf");
import * as turf from "@turf/turf";
const { VectorTile }: { VectorTile: VTileInit } = require("@mapbox/vector-tile");

process.on("unhandledRejection", reason => {
	throw reason;
});

interface VTileInit {
	new (protobuf: any, end?: number): VTile;
}
interface VTile {
	layers: {
		[name: string]: VTileLayer
	};
}
interface VTileLayer {
	version: number;
	name: string;
	extent: number;
	length: number;
	feature(i: number): VTileFeature;
}
enum VTileFeatureType {
	Unknown = 0,
	Point = 1,
	LineString = 2,
	Polygon = 3
}
interface VTileFeature<T = any> {
	type: VTileFeatureType;
	extent: number;
	id?: number;
	properties: T;
	loadGeometry(): {x: number; y: number;}[][];
	bbox(): [number, number, number, number];
	toGeoJSON(x: number, y: number, z: number): turf.Feature<turf.Polygon, T>;
}

async function readFileAsync(filename: string): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		fs.readFile(filename, (err, data) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(data);
		});
	});
}

let app = express();

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use("/node_modules", express.static("./node_modules"));
app.use("/css", express.static("./css"));
app.use("/js", express.static("./js"));
app.route("/system-production.js").get((request, response) => {
	fs.createReadStream("./system-production.js").pipe(response);
});
app.route("/dist.js").get((request, response) => {
	fs.createReadStream("./dist.js").pipe(response);
});
app.route("/dist.js.map").get((request, response) => {
	fs.createReadStream("./dist.js.map").pipe(response);
});;
app.route("/").get((request, response) => {
	fs.createReadStream("./index.html").pipe(response);
});

type Vector2 = [number, number]; // Note! Longitude, Latitude (x, y)
function getTileXY(location: Vector2, zoom: number): Vector2 {
	// From https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#X_and_Y
	const latRadians = location[1] * (Math.PI / 180);
	const n = 2 ** zoom;
	const x = Math.floor((location[0] + 180) / 360 * n);
	const y = Math.floor((1 - Math.log(Math.tan(latRadians) + (1 / Math.cos(latRadians))) / Math.PI) / 2 * n);

	return [x, y];
}
async function getTiles(topLeft: Vector2, bottomRight: Vector2, zoom: number = 14) {
	let topLeftXY = getTileXY(topLeft, zoom);
	let bottomRightXY = getTileXY(bottomRight, zoom);
	let tilesToGet: Vector2[] = [];
	for (let x = topLeftXY[0]; x <= bottomRightXY[0]; x++) {
		for (let y = topLeftXY[1]; y <= bottomRightXY[1]; y++) {
			tilesToGet.push([x, y]);
		}
	}

	let cacheCount = 0;
	for (let tile of tilesToGet) {
		const fileName = `./tile-cache/terrain-${zoom}-${tile[0]}-${tile[1]}.mvt`;
		if (fs.existsSync(fileName)) continue;

		const url = `https://a.tiles.mapbox.com/v4/mapbox.mapbox-terrain-v2/${zoom}/${tile[0]}/${tile[1]}.mvt?access_token=pk.eyJ1IjoicGV0c2NoZWtyIiwiYSI6ImNqZHY0YWExZDBlM3ozM2xidWMyZnRwMjkifQ.b65yhhfYo08ptlaRmSungw`
		let tileResponse = await fetch(url);
		let data = await tileResponse.buffer();
		// Cache data to disk
		fs.writeFileSync(fileName, data);
		cacheCount++;
	}
	if (cacheCount === 0) {
		console.info(`Found ${tilesToGet.length} tiles already cached`);
	}
	else {
		console.info(`Loaded and cached ${cacheCount} tiles`);
	}

}
// Bounding box of South Ossetia
getTiles([43.49349975585937, 42.687482878665385], [44.520721435546875, 41.92578147109541]);
app.route("/terrain/:coords").get(async (request, response) => {
	const zoom = 14;

	let rawPoints: string = request.params.coords;
	let points = rawPoints.split(";").map(pair => {
		return pair.split(",").map(coord => parseFloat(coord)) as Vector2;
	});

	enum LandCover {
		"urban",
		"crop",
		"grass",
		"scrub",
		"wood",
	}
	
	// Load tile data in parallel
	let existingTiles = new Map<string, VTile>();
	let data = await Promise.all(points.map(async point => {
		let tilePoint = getTileXY(point, zoom);
		let tile = existingTiles.get(tilePoint.join(","));
		if (!tile) {
			let data = await readFileAsync(`./tile-cache/terrain-${zoom}-${tilePoint[0]}-${tilePoint[1]}.mvt`);
			tile = new VectorTile(new pbf(data));
			existingTiles.set(tilePoint.join(","), tile);
		}

		let processed = {
			location: point,
			elevation: -Infinity,
			type: LandCover.urban
		};

		for (let i = 0; i < tile.layers.contour.length; i++) {
			let feature: VTileFeature<{ele: number; index: number}> = tile.layers.contour.feature(i);
			let polygon = feature.toGeoJSON(tilePoint[0], tilePoint[1], zoom);
			if (processed.elevation < feature.properties.ele && turf.booleanPointInPolygon(processed.location, polygon)) {
				processed.elevation = feature.properties.ele;
			}
		}
		for (let i = 0; i < tile.layers.landcover.length; i++) {
			let feature: VTileFeature<{class: keyof typeof LandCover}> = tile.layers.landcover.feature(i);
			let polygon = feature.toGeoJSON(tilePoint[0], tilePoint[1], zoom);
			if (processed.type < LandCover[feature.properties.class] && turf.booleanPointInPolygon(processed.location, polygon)) {
				processed.type = LandCover[feature.properties.class];
			}
		}

		return {
			...processed,
			type: LandCover[processed.type]
		};
	}));
	response.send(data);
});

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
