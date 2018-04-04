// import * as geojson from "geojson";
import { Vector2, Utilities, Team, Dispatcher, Entity, Waypoint } from "./common";
import { InfantrySquad, TankT55 } from "./units";
import {
	InfantryBattalion,
	T72Battalion,
	T62Battalion,
	T55Battalion,
	CobraBattalion,
	BMP2Battalion,
	BTR80Battalion,
	D30Battalion,
	DANABattalion,
	AkatsiyaBattalion,
	MRLBattalion,
	MountedInfantryBattalion,
	AgentCollection
} from "./collections";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

const MAPBOX_TOKEN = "pk.eyJ1IjoicGV0c2NoZWtyIiwiYSI6ImNqZHY0YWExZDBlM3ozM2xidWMyZnRwMjkifQ.b65yhhfYo08ptlaRmSungw";
mapboxgl.accessToken = MAPBOX_TOKEN;

export const DEBUGGING = false;

export const map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/mapbox/outdoors-v9?optimize=true",
	center: [43.968468, 42.218956],
	zoom: 11,
	bearingSnap: 20
});

export const SouthOssetiaArea: _turf.Feature<_turf.Polygon> = {
	"type": "Feature",
	"properties": {},
	"geometry": {
		"type": "Polygon",
		"coordinates": [
			[
				[
					43.60044479370117,
					42.50791968867423
				],
				[
					43.60147476196289,
					42.481212777716166
				],
				[
					43.584651947021484,
					42.46893136647922
				],
				[
					43.59306335449219,
					42.40469961745641
				],
				[
					43.60550880432129,
					42.39519228975215
				],
				[
					43.6226749420166,
					42.38555672822687
				],
				[
					43.602633476257324,
					42.36165161613105
				],
				[
					43.59675407409668,
					42.359780673121044
				],
				[
					43.59456539154053,
					42.35480179069942
				],
				[
					43.60027313232422,
					42.35080571438234
				],
				[
					43.66533279418945,
					42.33316920061983
				],
				[
					43.6735725402832,
					42.321366468801514
				],
				[
					43.6237907409668,
					42.28124601816194
				],
				[
					43.61005783081055,
					42.21237230564844
				],
				[
					43.705501556396484,
					42.14724173300881
				],
				[
					43.74189376831055,
					42.16734777729389
				],
				[
					43.80918502807617,
					42.15971332291788
				],
				[
					43.80025863647461,
					42.12585614727805
				],
				[
					43.84145736694336,
					42.10981221890284
				],
				[
					43.86445999145508,
					42.13196705153155
				],
				[
					43.87544631958008,
					42.1558957502758
				],
				[
					43.91115188598633,
					42.15869532606495
				],
				[
					44.141178131103516,
					42.1525870010334
				],
				[
					44.19731140136719,
					42.143296126605215
				],
				[
					44.26511764526367,
					42.109302821322125
				],
				[
					44.31318283081055,
					42.05783258117495
				],
				[
					44.531192779541016,
					42.04814539475198
				],
				[
					44.59848403930664,
					42.35334293514131
				],
				[
					44.265289306640625,
					42.58569703478024
				],
				[
					44.153194427490234,
					42.604273367064685
				],
				[
					44.12881851196289,
					42.61261195995393
				],
				[
					44.11766052246094,
					42.616654512266216
				],
				[
					44.107704162597656,
					42.61526491450728
				],
				[
					44.092769622802734,
					42.609832553019906
				],
				[
					44.089508056640625,
					42.60566321006406
				],
				[
					44.064788818359375,
					42.59997729266854
				],
				[
					44.0522575378418,
					42.602504431129994
				],
				[
					44.02238845825195,
					42.596944591213976
				],
				[
					44.004364013671875,
					42.58405396338937
				],
				[
					43.973636627197266,
					42.55396546451724
				],
				[
					43.95029067993164,
					42.55042468694409
				],
				[
					43.87716293334961,
					42.58531786830289
				],
				[
					43.75734329223633,
					42.596439126621554
				],
				[
					43.61778259277344,
					42.60983255301993
				],
				[
					43.60044479370117,
					42.50791968867423
				]
			]
		]
	}
};
export const TshkinvaliArea: _turf.Feature<_turf.Polygon> = {
	"type": "Feature",
	"properties": {},
	"geometry": {
		"type": "Polygon",
		"coordinates": [
			[
				[
					43.956298828125,
					42.24122708941077
				],
				[
					43.9557409286499,
					42.20830361029997
				],
				[
					43.984107971191406,
					42.209257234286305
				],
				[
					43.97702693939209,
					42.241798967222586
				],
				[
					43.956298828125,
					42.24122708941077
				]
			]
		]
	}
};

function initializeUnits(interdictPercentage: number): Entity[] {
	if (DEBUGGING) {
		// Return some fake debugging data that is easier to work with
		return [
			new MountedInfantryBattalion([43.952436447143555, 42.20022901694891], 5, [
				{ location: [43.89261245727539, 42.21211802] },
				{ location: [43.95647048950195, 42.22178015985047] },
				{ location: [43.96831512451172, 42.2162023613838] },
				{ location: [43.97471219301224, 42.23230274125556] },
				{ location: [43.96300435066223, 42.22481516512234] },
				{ location: [43.969130516052246, 42.20904664356124] },
				{ location: [43.97483825683594, 42.203654487208524] }
			], "41st Battalion", Team.Georgia),
			new T72Battalion([43.957414627075195, 42.20835923876126], 5, [
				{ location: [43.96301507949829, 42.2256493687579] },
				{ location: [43.97178053855896, 42.228692132394976] },
				{ location: [43.973894119262695, 42.2248310548184] },
				{ location: [43.96911978721619, 42.21902310452333] }
			], "TestTank Battalion", Team.Georgia),
			new T72Battalion([43.90325546264648, 42.349663931625585], 5, [
				{ location: [43.964388370513916, 42.246151422934474] },
				{ location: [43.95110607147217, 42.237064933651965] },
				{ location: [43.95110607147217, 42.237064933651965] },
				{ location: [43.92630100250244, 42.23296605397935] },
				{ location: [43.92630100250244, 42.23296605397935] },
				{ location: [43.95838022232056, 42.22184372166598] },
				{ location: [43.99296998977661, 42.15515606894359] }
			], "135 Motorized Rifle Regiment", Team.Russia)
		];
	}

	// South Ossetian capital city center
	const Tskhinvali: Waypoint = { location: [43.964393, 42.221488] };
	// village southwest of Tskhinvali
	const Khetagurovi: Waypoint = { location: [43.892284, 42.209940] };
	// town along the road to Roki tunnel
	const Java: Waypoint = { location: [43.922785, 42.390829] };
	// village/bridge north of Tskhinvali
	const DidiGupta: Waypoint = { location: [43.900573, 42.356981] };
	// tunnel leading to/from Russia
	const RokiTunnel: Waypoint = { location: [44.114961, 42.600887] };
	// village, S.O. district center (west of Tskhinvali)
	const Znauri: Waypoint = { location: [43.77322196960449, 42.19406111275616] };
	// town, S.O. district center (far southeast of Tskhinvali)
	const Akhalgori: Waypoint = { location: [44.4746876, 42.124288] };
	// nearest major Georgian city (emergency rendezvous point for Georgian forces)
	const Gori: Waypoint = { location: [44.1113238, 41.9869175] };
	// village far northwest of Tskhinvali
	const Kvaisi: Waypoint = { location: [43.6443297, 42.522274] };
	// village/road northwest of Tskhinvali
	const Dzari: Waypoint = { location: [43.870988, 42.286738] };
	// various points northeast of Tskhinvali
	const Dmenisi: Waypoint = { location: [44.067708, 42.271014] };
	const Sarabuki: Waypoint = { location: [44.0339178, 42.2698956] };
	const PrisiHeights: Waypoint = { location: [44.005045, 42.264837] };
	// various Georgian villages north of Tskhinvali in Bolshoy Liakhvi gorge
	const Achabeti: Waypoint = { location: [43.956440, 42.277728] };
	const Kekhvi: Waypoint = { location: [43.939403, 42.303673] };
	const Kemerti: Waypoint = { location: [43.937610, 42.318309] };

	return [
		/**GEORGIA**/

		/**West**/
		new MountedInfantryBattalion([43.884382, 42.146868], 16, [
			Khetagurovi,
			Dzari,
			(interdictPercentage >= 50) ? RokiTunnel : Tskhinvali
		], "41st Light Infantry Battalion", Team.Georgia),
		new MountedInfantryBattalion([43.884382, 42.146868], 16, [
			Khetagurovi,
			Dzari,
			(interdictPercentage >= 55) ? RokiTunnel : Tskhinvali
		], "42nd Light Infantry Battalion", Team.Georgia),
		new MountedInfantryBattalion([43.877702, 42.144644], 16, [
			Znauri,
			Dzari,
			(interdictPercentage >= 60) ? RokiTunnel : Tskhinvali
		], "43rd Light Infantry Battalion", Team.Georgia),
		new BTR80Battalion([43.884382, 42.146868], 8, [
			Khetagurovi,
			Dzari,
			(interdictPercentage >= 45) ? RokiTunnel : Tskhinvali
		], "4th Reconnaissance Company BTRs", Team.Georgia),
		new BMP2Battalion([43.884382, 42.146868], 15, [
			Khetagurovi,
			Dzari,
			(interdictPercentage >= 40) ? RokiTunnel : Tskhinvali
		], "44th Armored Battalion BMPs", Team.Georgia),
		new T72Battalion([43.884382, 42.146868], 30, [
			Khetagurovi,
			Dzari,
			(interdictPercentage >= 40) ? RokiTunnel : Tskhinvali
		], "44th Armored Battalion", Team.Georgia),
		new D30Battalion([43.884382, 42.146868], 18, [
			Khetagurovi,
			Dzari,
			(interdictPercentage >= 45) ? RokiTunnel : Tskhinvali
		], "45th Artillery Battalion", Team.Georgia),

		/**East**/
		new MountedInfantryBattalion([44.076805, 42.224923], 16, [
			PrisiHeights,
			Achabeti,
			(interdictPercentage >= 35) ? RokiTunnel : Tskhinvali
		], "31st Light Infantry Battalion", Team.Georgia),
		new MountedInfantryBattalion([44.076805, 42.224923], 16, [
			Sarabuki,
			Kekhvi,
			(interdictPercentage >= 30) ? RokiTunnel : Tskhinvali
		], "32nd Light Infantry Battalion", Team.Georgia),
		new MountedInfantryBattalion([44.076805, 42.224923], 16, [
			Dmenisi,
			Kemerti,
			(interdictPercentage >= 25) ? RokiTunnel : Tskhinvali
		], "33rd Light Infantry Battalion", Team.Georgia),
		new BTR80Battalion([44.076805, 42.224923], 8, [
			Sarabuki,
			Kekhvi,
			(interdictPercentage >= 20) ? RokiTunnel : Tskhinvali
		], "3rd Reconnaissance Company BTRs", Team.Georgia),
		new BMP2Battalion([44.076805, 42.224923], 15, [
			Dmenisi,
			Kemerti,
			(interdictPercentage >= 15) ? RokiTunnel : Tskhinvali
		], "34th Armored Battalion BMPs", Team.Georgia),
		new T72Battalion([44.076805, 42.224923], 30, [
			PrisiHeights,
			Achabeti,
			(interdictPercentage >= 15) ? RokiTunnel : Tskhinvali
		], "34th Armored Battalion", Team.Georgia),
		new D30Battalion([44.076805, 42.224923], 18, [
			PrisiHeights,
			Achabeti,
			(interdictPercentage >= 20) ? RokiTunnel : Tskhinvali
		], "35th Artillery Battalion", Team.Georgia),

		/**Center**/
		new InfantryBattalion([44.040621, 42.173988], 80, [
			Tskhinvali
		], "Interior Ministry special task forces 1", Team.Georgia),
		new CobraBattalion([44.040621, 42.173988], 70, [
			Tskhinvali
		], "Interior Ministry special task force Cobras", Team.Georgia),
		new MountedInfantryBattalion([43.955202, 42.165578], 8, [
			Tskhinvali,
			(interdictPercentage >= 90) ? RokiTunnel : Tskhinvali
		], "Georgian Special Operations Group", Team.Georgia),
		new InfantryBattalion([43.969603, 42.155248], 16, [
			Tskhinvali,
			(interdictPercentage >= 100) ? RokiTunnel : Tskhinvali
		], "Independent Light Infantry Battalion", Team.Georgia),
		new T72Battalion([43.943252, 42.165528], 15, [
			Tskhinvali,
			(interdictPercentage >= 65) ? RokiTunnel : Tskhinvali
		], "Independent Combined Tank Battalion", Team.Georgia),

		/**Reserve**/
		new InfantryBattalion([44.068055, 42.159849], 16, [
			Dmenisi,
			(interdictPercentage >= 85) ? RokiTunnel : Tskhinvali
		], "53rd Light Infantry Battalion", Team.Georgia),

		new D30Battalion([43.955202, 42.165578], 18, [
			(interdictPercentage >= 80) ? RokiTunnel : Tskhinvali
		], "15th Artillery Battalion", Team.Georgia),
		new DANABattalion([43.996816, 42.157214], 30, [
			(interdictPercentage >= 75) ? RokiTunnel : Tskhinvali
		], "Self-Propelled Artillery Battalion", Team.Georgia),
		new MRLBattalion([44.040621, 42.173988], 30, [
			(interdictPercentage >= 70) ? RokiTunnel : Tskhinvali
		], "MRL Battalion", Team.Georgia),

		/**Peacekeepers**/
		new InfantryBattalion([43.99526596069336, 42.196095951813454], 16, [
			(interdictPercentage >= 95) ? RokiTunnel : Tskhinvali
		], "11th Light Infantry Battalion", Team.Georgia),
		new BMP2Battalion([43.99526596069336, 42.196095951813454], 15, [
			(interdictPercentage >= 65) ? RokiTunnel : Tskhinvali
		], "Independent Combined Tank Battalion BMPs", Team.Georgia),

		/**Far West**/
		new MountedInfantryBattalion([43.597354888916016, 42.5045977676146], 16, [
			Kvaisi,
			Java,
			(interdictPercentage >= 5) ? RokiTunnel : Tskhinvali
		], "Interior Ministry CSD Combined Battalion", Team.Georgia),
		new MountedInfantryBattalion([43.59769821166992, 42.36133451106724], 16, [
			Java,
			(interdictPercentage >= 10) ? RokiTunnel : Tskhinvali
		], "Independent Combined Mountain Rifle Battalion", Team.Georgia),

		/**Far East**/
		new InfantryBattalion([44.489631, 42.012926], 20, [
			Akhalgori
		], "Interior Ministry special task forces 2", Team.Georgia),

		/**Reinforcements from Abkhazia**/
		new MountedInfantryBattalion([42.049641, 42.256798], 16, [
			Tskhinvali
		], "21st Light Infantry Battalion", Team.Georgia),
		new MountedInfantryBattalion([42.049641, 42.256798], 16, [
			Tskhinvali
		], "22nd Light Infantry Battalion", Team.Georgia),
		new MountedInfantryBattalion([42.049641, 42.256798], 16, [
			Tskhinvali
		], "23rd Light Infantry Battalion", Team.Georgia),
		new BTR80Battalion([42.049641, 42.256798], 8, [
			Tskhinvali
		], "2nd Reconnaissance Company BTRs", Team.Georgia),
		new BMP2Battalion([42.049641, 42.256798], 15, [
			Tskhinvali
		], "24th Armored Battalion BMPs", Team.Georgia),
		new T72Battalion([42.049641, 42.256798], 30, [
			Tskhinvali
		], "24th Armored Battalion", Team.Georgia),
		new D30Battalion([42.049641, 42.256798], 18, [
			Tskhinvali
		], "25th Artillery Battalion", Team.Georgia),

		/**RUSSIA**/

		/**Peacekeepers, southern compound**/
		new InfantryBattalion([43.956153, 42.209031], 8, [
		], "135th MR 2nd Battalion 1", Team.Russia),
		new BMP2Battalion([43.956153, 42.209031], 15, [
		], "135th MR 2nd Battalion BMPs 1", Team.Russia),

		new BTR80Battalion([43.956153, 42.209031], 10, [
		], "10th Indepdendent Spetsnaz Brigade Reconnaissance Company", Team.Russia),
		new InfantryBattalion([43.956153, 42.209031], 4, [
		], "22nd Indepdendent Spetsnaz Brigade", Team.Russia),

		new InfantryBattalion([43.956153, 42.209031], 8, [
		], "North Ossetian Alaniya Battalion 1", Team.Russia),
		new BMP2Battalion([43.956153, 42.209031], 8, [
		], "North Ossetian Alaniya Battalion BMPs 1", Team.Russia),

		/**Peacekeepers, northern compound**/
		new InfantryBattalion([43.958890, 42.234057], 8, [
		], "135th MR 2nd Battalion 2", Team.Russia),
		new BMP2Battalion([43.958890, 42.234057], 30, [
		], "135th MR 2nd Battalion BMPs 2", Team.Russia),

		new InfantryBattalion([43.958890, 42.234057], 4, [
		], "10th Indepdendent Spetsnaz Brigade 1", Team.Russia),

		new InfantryBattalion([43.958890, 42.234057], 8, [
		], "North Ossetian Alaniya Battalion 2", Team.Russia),
		new BMP2Battalion([43.958890, 42.234057], 8, [
		], "North Ossetian Alaniya Battalion BMPs 2", Team.Russia),

		/**Initial QRF, primary training range**/
		new MountedInfantryBattalion([43.839789, 42.662262], 16, [
			RokiTunnel,
			Java,
			Achabeti
		], "135th MR 1st Battalion", Team.Russia),
		new BMP2Battalion([43.839789, 42.662262], 45, [
			RokiTunnel,
			Java,
			Achabeti
		], "135th MR 1st Battalion BMPs", Team.Russia),
		new BTR80Battalion([43.839789, 42.662262], 10, [
			RokiTunnel,
			Java,
			Achabeti
		], "135th MR Reconnaissance Company", Team.Russia),

		new MountedInfantryBattalion([43.839789, 42.662262], 16, [
			RokiTunnel,
			Java
		], "693rd MR 1st Battalion", Team.Russia),
		new BMP2Battalion([43.839789, 42.662262], 45, [
			RokiTunnel,
			Java
		], "693rd MR 1st Battalion BMPs", Team.Russia),
		new BTR80Battalion([43.839789, 42.662262], 10, [
			RokiTunnel
		], "693rd MR Reconnaissance Company", Team.Russia),

		new T72Battalion([43.839789, 42.662262], 14, [
			RokiTunnel,
			Java,
			DidiGupta
		], "QRF Tank Battalion", Team.Russia),
		new AkatsiyaBattalion([43.839789, 42.662262], 16, [
			RokiTunnel,
			Java,
			DidiGupta
		], "QRF Artillery Battalion", Team.Russia),

		/**Initial QRF, secondary training range**/
		new MRLBattalion([44.122782, 42.642049], 9, [
			RokiTunnel,
			Java,
			DidiGupta
		], "QRF MRL Battalion", Team.Russia),

		/**19th MR Division**/
		//stationed in Troitskoye
		new MountedInfantryBattalion([44.619771, 43.765389], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "503rd MR 1st Battalion", Team.Russia),
		new BMP2Battalion([44.619771, 43.765389], 45, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "503rd MR 1st Battalion BMPs", Team.Russia),
		new MountedInfantryBattalion([44.619771, 43.765389], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "503rd MR 2nd Battalion", Team.Russia),
		new BMP2Battalion([44.619771, 43.765389], 45, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "503rd MR 2nd Battalion BMPs", Team.Russia),
		new T72Battalion([44.619771, 43.765389], 10, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "503rd MR Tank Company", Team.Russia),

		//stationed in Vladikavkaz
		new MountedInfantryBattalion([44.718186, 43.042600], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "429th MR 1st Battalion", Team.Russia),
		new BMP2Battalion([44.718186, 43.042600], 45, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "429th MR 1st Battalion BMPs", Team.Russia),
		new MountedInfantryBattalion([44.718186, 43.042600], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "429th MR 2nd Battalion", Team.Russia),
		new BMP2Battalion([44.718186, 43.042600], 45, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "429th MR 2nd Battalion BMPs", Team.Russia),
		new T72Battalion([44.718186, 43.042600], 10, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "429th MR Tank Company 1", Team.Russia),
		new T72Battalion([44.718186, 43.042600], 10, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "429th MR Tank Company 2", Team.Russia),

		new MountedInfantryBattalion([44.718186, 43.042600], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "693rd MR 2nd Battalion", Team.Russia),
		new BMP2Battalion([44.718186, 43.042600], 45, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "693rd MR 2nd Battalion BMPs", Team.Russia),
		new MountedInfantryBattalion([44.718186, 43.042600], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "693rd MR 3rd Battalion", Team.Russia),
		new BTR80Battalion([44.718186, 43.042600], 60, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "693rd MR 3rd Battalion BTRs", Team.Russia),
		new T72Battalion([44.718186, 43.042600], 30, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "693rd MR Tank Battalion", Team.Russia),

		new AkatsiyaBattalion([44.718186, 43.042600], 18, [
			RokiTunnel,
			Tskhinvali
		], "292nd Self-Propelled Artillery 1st Battalion", Team.Russia),
		new AkatsiyaBattalion([44.718186, 43.042600], 18, [
			RokiTunnel,
			Tskhinvali
		], "292nd Self-Propelled Artillery 2nd Battalion", Team.Russia),
		new MRLBattalion([44.718186, 43.042600], 18, [
			RokiTunnel,
			Tskhinvali
		], "292nd MRL Battalion", Team.Russia),

		new T72Battalion([44.718186, 43.042600], 30, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "141st Independent Tank Battalion", Team.Russia),
		new MountedInfantryBattalion([44.718186, 43.042600], 8, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "239th Independent Reconnaissance Battalion", Team.Russia),

		/**42nd MR Division**/
		//stationed in Shali
		new MountedInfantryBattalion([45.841593, 43.155187], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "70th MR 1st Battalion", Team.Russia),
		new BMP2Battalion([45.841593, 43.155187], 45, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "70th MR 1st Battalion BMPs", Team.Russia),
		new MountedInfantryBattalion([45.841593, 43.155187], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "70th MR 2nd Battalion", Team.Russia),
		new BTR80Battalion([45.841593, 43.155187], 60, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "70th MR 2nd Battalion BTRs", Team.Russia),
		new T62Battalion([45.841593, 43.155187], 10, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "70th Tank Company", Team.Russia),

		// stationed in Khankala
		new MountedInfantryBattalion([45.740135, 43.300917], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "71st MR 1st Battalion", Team.Russia),
		new BMP2Battalion([45.740135, 43.300917], 45, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "71st MR 1st Battalion BMPs", Team.Russia),
		new MountedInfantryBattalion([45.740135, 43.300917], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "71st MR 2nd Battalion", Team.Russia),
		new BTR80Battalion([45.740135, 43.300917], 60, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "71st MR 2nd Battalion BTRs", Team.Russia),
		new MountedInfantryBattalion([45.740135, 43.300917], 16, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "71st MR 3rd Battalion", Team.Russia),
		new BTR80Battalion([45.740135, 43.300917], 60, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "71st MR 3rd Battalion BTRs", Team.Russia),
		new T62Battalion([45.740135, 43.300917], 30, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "71st Tank Battalion", Team.Russia),

		new AkatsiyaBattalion([45.740135, 43.300917], 18, [
			RokiTunnel,
			Tskhinvali
		], "50th Self-Propelled Artillery 1st Battalion", Team.Russia),
		new AkatsiyaBattalion([45.740135, 43.300917], 18, [
			RokiTunnel,
			Tskhinvali
		], "50th Self-Propelled Artillery 2nd Battalion", Team.Russia),
		new AkatsiyaBattalion([45.740135, 43.300917], 18, [
			RokiTunnel,
			Tskhinvali
		], "50th Self-Propelled Artillery 3rd Battalion", Team.Russia),
		new MRLBattalion([45.740135, 43.300917], 18, [
			RokiTunnel,
			Tskhinvali
		], "50th MRL Battalion", Team.Russia),

		new MountedInfantryBattalion([45.740135, 43.300917], 8, [
			RokiTunnel,
			Tskhinvali,
			Gori
		], "417th Independent Reconnaissance Battalion", Team.Russia),
		new MountedInfantryBattalion([44.226885, 43.021807], 4, [
			RokiTunnel,
			Tskhinvali,
		], "Vostok Battalion", Team.Russia),
		new MountedInfantryBattalion([44.226885, 43.021807], 4, [
			RokiTunnel,
			Tskhinvali,
		], "Zapad Battalion", Team.Russia),

		/**Other**/
		new MountedInfantryBattalion([44.226885, 43.021807], 12, [
			RokiTunnel,
			Tskhinvali
		], "10th Indepdendent Spetsnaz Brigade 2", Team.Russia),
		new MountedInfantryBattalion([44.226885, 43.021807], 4, [
			RokiTunnel,
			Tskhinvali
		], "45th Indepdendent Recon Spetsnaz Regiment", Team.Russia),

		new MountedInfantryBattalion([44.601775, 43.195225], 12, [
			RokiTunnel,
			Achabeti
		], "104th Air Assault", Team.Russia),
		new BMP2Battalion([44.601775, 43.195225], 20, [
			RokiTunnel,
			Achabeti
		], "104th Air Assault BMDs", Team.Russia),
		new MountedInfantryBattalion([44.601775, 43.195225], 12, [
			RokiTunnel,
			Achabeti
		], "234th Air Assault", Team.Russia),
		new BMP2Battalion([44.601775, 43.195225], 20, [
			RokiTunnel,
			Achabeti
		], "234th Air Assault BMDs", Team.Russia),

		/**SOUTH OSSETIA**/

		/**Militia**/
		new T55Battalion([43.962491, 42.211796], 10, [
		], "South Ossetian Tanks", Team.SouthOssetia),
		new MRLBattalion([43.964393, 42.221488], 10, [
		], "South Ossetian MRLs", Team.SouthOssetia),
		new InfantryBattalion([43.959390, 42.206754], 8, [
		], "South Ossetian Unit 1", Team.SouthOssetia),
		new InfantryBattalion([43.962491, 42.211796], 16, [
		], "South Ossetian Unit 2", Team.SouthOssetia),
		new InfantryBattalion([44.049107, 42.270518], 12, [
		], "South Ossetian Unit 3", Team.SouthOssetia),
		new InfantryBattalion([43.978487, 42.206198], 32, [
		], "South Ossetian 4th Battalion", Team.SouthOssetia),
		new InfantryBattalion([43.896058, 42.211914], 8, [
		], "South Ossetian Unit 4", Team.SouthOssetia),
		new InfantryBattalion([43.896058, 42.211914], 8, [
		], "South Ossetian Unit 5", Team.SouthOssetia),
		new InfantryBattalion([43.6443297, 42.522274], 12, [
		], "South Ossetian Unit 6", Team.SouthOssetia),
		new InfantryBattalion([43.77322196960449, 42.19406111275616], 8, [
		], "South Ossetian Unit 7", Team.SouthOssetia),
		new InfantryBattalion([44.4746876, 42.124288], 8, [
		], "South Ossetian Unit 8", Team.SouthOssetia),
	];
}

map.on("load", () => start());

export let dispatcher: Dispatcher;
async function start() {
	let isReset = true;
	let currentUpdate: number | null = null;
	const startDate = new Date("2008-08-08T00:00:00+04:00"); // August 8th, 2008 @ midnight
	let units: Entity[];

	const timeElement = document.getElementById("time")!;
	const outputArea = document.getElementById("output") as HTMLTextAreaElement;
	const tickProgress = document.getElementById("tick-progress") as HTMLParagraphElement;
	const automate = document.getElementById("automate") as HTMLInputElement;

	const scenarioSlider = document.getElementById("scenario") as HTMLInputElement;
	const scenarioValue = document.getElementById("scenario-value") as HTMLSpanElement;
	let scenarioPercentage: number = 0;

	let iteration = 0;
	const iterations = document.getElementById("iterations") as HTMLInputElement;

	function initialize() {
		timeElement.textContent = "Initializing...";
		tickProgress.textContent = "";

		if (dispatcher) {
			for (let id of dispatcher.layerIDs) {
				// Layer and source IDs are the same
				map.removeLayer(id).removeSource(id);
			}
		}

		units = initializeUnits(scenarioPercentage);
		let unitCount = units.reduce((prev, collection) => {
			if (collection instanceof AgentCollection) {
				return prev + collection.units.length;
			}
			return prev;
		}, 0);
		console.info(`Initialized with ${units.length.toLocaleString()} collections and ${unitCount.toLocaleString()} units`);
		dispatcher = new Dispatcher(startDate, units, scenarioPercentage);
		timeElement.textContent = dispatcher.formattedTime;
		outputArea.value = "";
	}
	function sliderSet() {
		scenarioPercentage = parseFloat(scenarioSlider.value);
		scenarioValue.textContent = scenarioPercentage.toString();
		initialize();
	}
	scenarioSlider.addEventListener("input", sliderSet);
	initialize();

	const stopButton = document.getElementById("stop")!;
	const resetButton = document.getElementById("reset")!;
	let shouldStop = true;
	stopButton.addEventListener("click", () => {
		shouldStop = !shouldStop;
		if (!shouldStop) {
			if (isReset) {
				isReset = false;
				outputArea.value = `--- New simulation (iter: 1 / ${iterations.value}, slider: ${scenarioPercentage}%) ---\n`;
			}
			resetButton.style.display = "inline";
			stopButton.textContent = "Stop";
			scenarioSlider.disabled = true;
			update();
		}
		else {
			stopButton.textContent = "Start";
			if (currentUpdate !== null) {
				window.clearTimeout(currentUpdate);
			}
		}
	});
	function reset() {
		isReset = true;
		shouldStop = true;
		if (currentUpdate !== null) {
			window.clearTimeout(currentUpdate);
		}
		AgentCollection.instances = [];
		stopButton.textContent = "Start";
		resetButton.style.display = "none";
		scenarioSlider.disabled = false;
		initialize();
	}
	resetButton.addEventListener("click", reset);

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

		if (dispatcher.finished && automate.checked) {
			iteration++;
			shouldStop = true;
			stopButton.textContent = "Start";
			if (currentUpdate !== null) {
				window.clearTimeout(currentUpdate);
			}
			if (scenarioPercentage < parseFloat(scenarioSlider.max)) {
				// Save and restore the output
				let output = outputArea.value;
				reset();
				if (iteration >= parseInt(iterations.value, 10)) {
					scenarioSlider.value = (scenarioPercentage + parseFloat(scenarioSlider.step)).toString();
					iteration = 0;
				}
				sliderSet();
				outputArea.value = output + `\n\n--- New simulation (iter: ${iteration + 1} / ${iterations.value}, slider: ${scenarioPercentage}%) ---\n`;
				shouldStop = false;
				resetButton.style.display = "inline";
				stopButton.textContent = "Stop";
				scenarioSlider.disabled = true;
				update();
			}
		}
		else if (!shouldStop) {
			currentUpdate = window.setTimeout(update, tickDelay);
			//window.requestAnimationFrame(update);
		}
	}
}

async function wait(milliseconds: number): Promise<void> {
	return new Promise<void>(resolve => {
		window.setTimeout(() => resolve(), milliseconds);
	});
}
