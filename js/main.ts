// import * as geojson from "geojson";
import { Vector2, Utilities, Team, Dispatcher, Entity } from "./common";
import { InfantrySquad, TankT55 } from "./units";
import {
	InfantryBattalion,
	T72Battalion,
	T55Battalion,
	CobraBattalion,
	BMP2Battalion,
	BTR80Battalion,
	//ArtilleryBattalion,
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

const SouthOssetia: _turf.Feature<_turf.Polygon> = {
	"type": "Feature",
	"properties": {},
	"geometry": {
		"type": "Polygon",
		"coordinates": [
			[
				[
					43.60095977783203,
					42.50804623455747
				],
				[
					43.60198974609375,
					42.48133937765146
				],
				[
					43.585166931152344,
					42.46905799126156
				],
				[
					43.59357833862305,
					42.40482637209412
				],
				[
					43.60602378845215,
					42.39531906359705
				],
				[
					43.62318992614746,
					42.38568352153437
				],
				[
					43.603148460388184,
					42.361778457708425
				],
				[
					43.59726905822753,
					42.359907518475374
				],
				[
					43.59508037567139,
					42.35492864610414
				],
				[
					43.60078811645508,
					42.350932577852824
				],
				[
					43.66584777832031,
					42.33329609968094
				],
				[
					43.67408752441406,
					42.321493391673876
				],
				[
					43.624305725097656,
					42.28137302193453
				],
				[
					43.6105728149414,
					42.21249944815517
				],
				[
					43.706016540527344,
					42.14736900654062
				],
				[
					43.742408752441406,
					42.167475010395336
				],
				[
					43.809700012207024,
					42.15984057137299
				],
				[
					43.80077362060547,
					42.12598346379611
				],
				[
					43.84197235107422,
					42.109939567658415
				],
				[
					43.86497497558594,
					42.13209435576815
				],
				[
					43.872528076171875,
					42.166202667865356
				],
				[
					43.91166687011719,
					42.15882257656716
				],
				[
					43.92986297607422,
					42.20359885460438
				],
				[
					43.90686035156249,
					42.218347726793304
				],
				[
					43.90892028808594,
					42.220636036229536
				],
				[
					43.955526351928704,
					42.2068095704436
				],
				[
					43.972434997558594,
					42.19949780203024
				],
				[
					43.97470951080322,
					42.20045155894027
				],
				[
					43.97870063781738,
					42.20391675453974
				],
				[
					43.98273468017578,
					42.20353527442536
				],
				[
					43.9823055267334,
					42.20820824710954
				],
				[
					43.98917198181152,
					42.20887578641935
				],
				[
					43.9877986907959,
					42.215423655170284
				],
				[
					44.03921127319336,
					42.217203540978154
				],
				[
					44.044532775878906,
					42.23055108552288
				],
				[
					44.06822204589844,
					42.242497921953635
				],
				[
					44.0936279296875,
					42.228263135437075
				],
				[
					44.111480712890625,
					42.17561739661684
				],
				[
					44.14581298828125,
					42.15093256154525
				],
				[
					44.20074462890625,
					42.15016895950386
				],
				[
					44.27936553955078,
					42.111467732769135
				],
				[
					44.313697814941406,
					42.05796003430605
				],
				[
					44.531707763671875,
					42.04827286732349
				],
				[
					44.5989990234375,
					42.353469793490646
				],
				[
					44.153709411621094,
					42.604399717709555
				],
				[
					44.12933349609374,
					42.61273829368574
				],
				[
					44.1181755065918,
					42.61678083779763
				],
				[
					44.108219146728516,
					42.615391242857555
				],
				[
					44.093284606933594,
					42.60995889238943
				],
				[
					44.09002304077148,
					42.60578955789012
				],
				[
					44.065303802490234,
					42.60010365202599
				],
				[
					44.052772521972656,
					42.6026307853624
				],
				[
					44.02290344238281,
					42.597070956721446
				],
				[
					44.004878997802734,
					42.58418035503378
				],
				[
					43.974151611328125,
					42.55409191714403
				],
				[
					43.9508056640625,
					42.55055114674488
				],
				[
					43.87767791748047,
					42.58544425738491
				],
				[
					43.75785827636719,
					42.59656549315401
				],
				[
					43.60095977783203,
					42.50804623455747
				]
			]
		]
	}
};
const TshkinvaliArea: _turf.Feature<_turf.Polygon> = {
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
			new T72Battalion([44.09646, 42.62257], 5, [
				{ location: [44.117457, 42.563961] },
				{ location: [44.059123992919915, 42.452214646756104] },
				{ location: [43.90325546264648, 42.349663931625585] },
				{ location: [43.964388370513916, 42.246151422934474] },
				{ location: [43.95110607147217, 42.237064933651965] },
				{ location: [43.95110607147217, 42.237064933651965] },
				{ location: [43.92630100250244, 42.23296605397935] },
				{ location: [43.92630100250244, 42.23296605397935] },
				{ location: [43.95838022232056, 42.22184372166598] }
			], "135 Motorized Rifle Regiment", Team.Russia)
		];
	}

	// South Ossetian capital city center
	const Tshkinvali = { location: [43.9506527, 42.231969] };
	// village southwest of Tshkinvali
	const Khetagurovi = { location: [43.8887822, 42.2087085] };
	// town along the road to Roki tunnel
	const Java = { location: [43.9160973, 42.3893807] };
	// village/bridge north of Tshkinvali
	const DidiGupta = { location: [43.8966057, 42.352512] };
	// tunnel leading to/from Russia
	const Roki = { location: [44.1068293, 42.6068712] };
	// village, S.O. district center (west of Tshkinvali)
	const Kornisi = { location: [43.7641379, 42.1947829] };
	// town, S.O. district center (far southeast of Tshkinvali)
	const Akhalgori = { location: [44.4746876, 42.124288] };
	// nearest major Georgian city (emergency rendezvous point for Georgian forces)
	const Gori = { location: [44.1113238, 41.9869175] };
	// village far northwest of Tshkinvali
	const Kvaisi = { location: [43.6443297, 42.522274] };
	// village/road northwest of Tshkinvali
	const Dzari = { location: [43.8672982, 42.2816823] };
	// various points northeast of Tshkinvali
	const Dmenisi = { location: [44.047269, 42.2623958] };
	const Sarabuki = { location: [44.0339178, 42.2698956] };
	const PrisiHeights = { location: [44.005045, 42.264837] };

	return [
		/**GEORGIA**/

		/**Peacekeepers**/
		new InfantryBattalion([43.99526596069336, 42.196095951813454], 16, [
		], "11th Light Infantry Battalion", Team.Georgia),
		new BMP2Battalion([43.99526596069336, 42.196095951813454], 15, [
		], "Independent Combined Tank Battalion BMPs", Team.Georgia),

		/**West**/
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] }
		], "41st Light Infantry Battalion", Team.Georgia),
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] }
		], "42nd Light Infantry Battalion", Team.Georgia),
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.77322196960449, 42.19406111275616] }
		], "43rd Light Infantry Battalion", Team.Georgia),
		new BTR80Battalion([43.952436447143555, 42.20022901694891], 8, [
			{ location: [43.77322196960449, 42.19406111275616] }
		], "4th Reconnaissance Company BTRs", Team.Georgia),
		new BMP2Battalion([43.952436447143555, 42.20022901694891], 15, [
			{ location: [43.77322196960449, 42.19406111275616] }
		], "44th Armored Battalion BMPs", Team.Georgia),
		new T72Battalion([43.952436447143555, 42.20022901694891], 30, [
		], "44th Armored Battalion", Team.Georgia),
		// new ArtilleryBattalion([43.952436447143555, 42.20022901694891], 18, [
		// ], "45th Artillery Battalion", Team.Georgia),

		/**East**/
		new InfantryBattalion([44.03217315673828, 42.21046513733562], 16, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "31st Light Infantry Battalion", Team.Georgia),
		new InfantryBattalion([44.03217315673828, 42.21046513733562], 16, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "32nd Light Infantry Battalion", Team.Georgia),
		new InfantryBattalion([44.03217315673828, 42.21046513733562], 16, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "33rd Light Infantry Battalion", Team.Georgia),
		new BTR80Battalion([44.03217315673828, 42.21046513733562], 8, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "3rd Reconnaissance Company BTRs", Team.Georgia),
		new BMP2Battalion([44.03217315673828, 42.21046513733562], 15, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "34th Armored Battalion BMPs", Team.Georgia),
		new T72Battalion([44.03217315673828, 42.21046513733562], 30, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "34th Armored Battalion", Team.Georgia),
		// new ArtilleryBattalion([44.03217315673828, 42.21046513733562], 18, [
		// 	{ location: [44.03114318847656, 42.24090937727564] },
		// 	{ location: [44.06041145324707, 42.27502251971017] }
		// ], "35th Artillery Battalion", Team.Georgia),

		/**Center**/
		new MountedInfantryBattalion([44.03672218322754, 42.177080370547195], 60, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Interior Ministry special task forces 1", Team.Georgia),
		new CobraBattalion([44.03672218322754, 42.177080370547195], 70, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Interior Ministry special task force Cobras", Team.Georgia),
		new MountedInfantryBattalion([44.03672218322754, 42.177080370547195], 8, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Georgian Special Operations Group", Team.Georgia),
		new InfantryBattalion([44.03672218322754, 42.177080370547195], 16, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Independent Light Infantry Battalion", Team.Georgia),
		new T72Battalion([43.96385192871094, 42.163594285679395], 30, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Independent Combined Tank Battalion", Team.Georgia),

		/**Reserve**/
		new InfantryBattalion([43.99955749511719, 42.15335057390396], 16, [
		], "53rd Light Infantry Battalion", Team.Georgia),
		// new ArtilleryBattalion([43.99526596069336, 42.196095951813454], 18, [
		// ], "15th Artillery Battalion", Team.Georgia),

		/**Far West**/
		new InfantryBattalion([43.597354888916016, 42.5045977676146], 16, [
			{ location: [43.631858825683594, 42.509817850023786] }
		], "Interior Ministry CSD Combined Battalion", Team.Georgia),
		new InfantryBattalion([43.59769821166992, 42.36133451106724], 16, [
		], "Independent Combined Mountain Rifle Battalion", Team.Georgia),

		/**Far East**/
		new InfantryBattalion([43.597354888916016, 42.5045977676146], 16, [
			{ location: [43.631858825683594, 42.509817850023786] }
		], "Interior Ministry special task forces 2", Team.Georgia),

		/**Fire support in Gori**/
		// new ArtilleryBattalion([43.99526596069336, 42.196095951813454], 30, [
		// ], "Self-Propelled Artillery Battalion", Team.Georgia),
		// new ArtilleryBattalion([43.99526596069336, 42.196095951813454], 20, [
		// ], "MRL Battalion 1", Team.Georgia),
		// new ArtilleryBattalion([43.99526596069336, 42.196095951813454], 20, [
		// ], "MRL Battalion 2", Team.Georgia),

		/**Reinforcements from Abkhazia**/
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] }
		], "21st Light Infantry Battalion", Team.Georgia),
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] }
		], "22nd Light Infantry Battalion", Team.Georgia),
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.77322196960449, 42.19406111275616] }
		], "23rd Light Infantry Battalion", Team.Georgia),
		new BTR80Battalion([43.952436447143555, 42.20022901694891], 8, [
		], "2nd Reconnaissance Company BTRs", Team.Georgia),
		new BMP2Battalion([43.952436447143555, 42.20022901694891], 15, [
		], "24th Armored Battalion BMPs", Team.Georgia),
		new T72Battalion([43.952436447143555, 42.20022901694891], 30, [
		], "24th Armored Battalion", Team.Georgia),
		// new ArtilleryBattalion([43.952436447143555, 42.20022901694891], 18, [
		// ], "25th Artillery Battalion", Team.Georgia),

		/**RUSSIA**/

		/**Peacekeepers**/
		new InfantryBattalion([43.9671467, 42.2279047], 16, [
		], "Russian Peacekeeper Battalion", Team.Russia),

		/**19th MR Division**/
		new MountedInfantryBattalion([44.095187, 42.619808], 16, [
			{ location: [44.117495, 42.563956] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934983, 42.225159] },
			{ location: [43.958130, 42.221841] },
			{ location: [43.938932, 42.225042] }
		], "135th MR Battalion 1", Team.Russia),
		new BMP2Battalion([44.095247, 42.619793], 30, [
			{ location: [44.117495, 42.563956] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934983, 42.225159] },
			{ location: [43.958130, 42.221841] },
			{ location: [43.938932, 42.225042] }
		], "135th MR Battalion 1 BMPs", Team.Russia),
		new MountedInfantryBattalion([44.095187, 42.619808], 16, [
			{ location: [44.117495, 42.563956] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934983, 42.225159] },
			{ location: [43.958130, 42.221841] },
			{ location: [43.938932, 42.225042] }
		], "135th MR Battalion 2", Team.Russia),
		new BMP2Battalion([44.095247, 42.619793], 30, [
			{ location: [44.117495, 42.563956] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934983, 42.225159] },
			{ location: [43.958130, 42.221841] },
			{ location: [43.938932, 42.225042] }
		], "135th MR Battalion 2 BMPs", Team.Russia),

		new MountedInfantryBattalion([44.095247, 42.619793], 16, [
			{ location: [44.117495, 42.563956] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934983, 42.225159] },
			{ location: [43.958130, 42.221841] },
			{ location: [43.938932, 42.225042] }
		], "429th MR Battalion 1", Team.Russia),
		new BMP2Battalion([44.095247, 42.619793], 30, [
			{ location: [44.117495, 42.563956] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934983, 42.225159] },
			{ location: [43.958130, 42.221841] },
			{ location: [43.938932, 42.225042] }
		], "429th MR Battalion 1 BMPs", Team.Russia),
		new MountedInfantryBattalion([44.095247, 42.619793], 16, [
			{ location: [44.117495, 42.563956] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934983, 42.225159] },
			{ location: [43.958130, 42.221841] },
			{ location: [43.938932, 42.225042] }
		], "429th MR Battalion 2", Team.Russia),
		new BMP2Battalion([44.095247, 42.619793], 30, [
			{ location: [44.117495, 42.563956] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934983, 42.225159] },
			{ location: [43.958130, 42.221841] },
			{ location: [43.938932, 42.225042] }
		], "429th MR Battalion 2 BMPs", Team.Russia),
		new T72Battalion([44.095247, 42.619793], 10, [
			{ location: [44.117495, 42.563956] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934983, 42.225159] },
			{ location: [43.958130, 42.221841] },
			{ location: [43.938932, 42.225042] }
		], "429th Tank Company 1", Team.Russia),
		new T72Battalion([44.095247, 42.619793], 10, [
			{ location: [44.117495, 42.563956] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934983, 42.225159] },
			{ location: [43.958130, 42.221841] },
			{ location: [43.938932, 42.225042] }
		], "429th Tank Company 2", Team.Russia),

		new MountedInfantryBattalion([44.094480, 42.620106], 16, [
			{ location: [43.928737, 42.225538] },
			{ location: [43.956550, 42.221885] }
		], "503rd MR Battalion 1", Team.Russia),
		new BMP2Battalion([44.094480, 42.620106], 30, [
			{ location: [43.928737, 42.225538] },
			{ location: [43.956550, 42.221885] }
		], "503rd MR Battalion 1 BMPs", Team.Russia),
		new MountedInfantryBattalion([44.094480, 42.620106], 16, [
			{ location: [43.928737, 42.225538] },
			{ location: [43.956550, 42.221885] }
		], "503rd MR Battalion 2", Team.Russia),
		new BMP2Battalion([44.094480, 42.620106], 30, [
			{ location: [43.928737, 42.225538] },
			{ location: [43.956550, 42.221885] }
		], "503rd MR Battalion 2 BMPs", Team.Russia),
		new T72Battalion([44.094480, 42.620106], 10, [
			{ location: [43.928737, 42.225538] },
			{ location: [43.956550, 42.221885] }
		], "503rd Tank Company", Team.Russia),

		new MountedInfantryBattalion([44.095098, 42.619851], 16, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd MR Battalion 1", Team.Russia),
		new BMP2Battalion([44.095098, 42.619851], 30, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd MR Battalion 1 BMPs", Team.Russia),
		new MountedInfantryBattalion([44.095098, 42.619851], 16, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd MR Battalion 2", Team.Russia),
		new BMP2Battalion([44.095098, 42.619851], 30, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd MR Battalion 2 BMPs", Team.Russia),
		new MountedInfantryBattalion([44.095098, 42.619851], 16, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd MR Battalion 3", Team.Russia),
		new BMP2Battalion([44.095098, 42.619851], 30, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd MR Battalion 3 BMPs", Team.Russia),
		new T72Battalion([44.095098, 42.619851], 30, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd Tank Battalion", Team.Russia),

		// new ArtilleryBattalion([44.095118, 42.619849], 18, [
		// 	{ location: [44.116193, 42.562299] },
		// 	{ location: [43.889027, 42.216375] },
		// 	{ location: [43.934431, 42.225161] },
		// 	{ location: [43.958110, 42.221842] },
		// 	{ location: [43.938932, 42.225042] }
		// ], "292nd Self-Propelled Artillery Battalion 1", Team.Russia),
		// new ArtilleryBattalion([44.095118, 42.619849], 18, [
		// 	{ location: [44.116193, 42.562299] },
		// 	{ location: [43.889027, 42.216375] },
		// 	{ location: [43.934431, 42.225161] },
		// 	{ location: [43.958110, 42.221842] },
		// 	{ location: [43.938932, 42.225042] }
		// ], "292nd Self-Propelled Artillery Battalion 2", Team.Russia),
		// new ArtilleryBattalion([44.095118, 42.619849], 18, [
		// 	{ location: [44.116193, 42.562299] },
		// 	{ location: [43.889027, 42.216375] },
		// 	{ location: [43.934431, 42.225161] },
		// 	{ location: [43.958110, 42.221842] },
		// 	{ location: [43.938932, 42.225042] }
		// ], "292nd Self-Propelled Artillery Battalion 3", Team.Russia),

		new T72Battalion([44.095118, 42.619849], 30, [
			{ location: [44.116193, 42.562299] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934431, 42.225161] },
			{ location: [43.958110, 42.221842] },
			{ location: [43.938932, 42.225042] }
		], "141st Independent Tank Battalion", Team.Russia),
		new MountedInfantryBattalion([44.095118, 42.619849], 8, [
			{ location: [44.116193, 42.562299] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934431, 42.225161] },
			{ location: [43.958110, 42.221842] },
			{ location: [43.938932, 42.225042] }
		], "239th Independent Reconnaissance Battalion", Team.Russia),

		/**42nd MR Division**/
		new MountedInfantryBattalion([44.021421, 42.658106], 16, [
			{ location: [43.931235, 42.320023] }
		], "70th MR Battalion 1", Team.Russia),
		new BMP2Battalion([44.021421, 42.658106], 30, [
			{ location: [43.931235, 42.320023] }
		], "70th MR Battalion 1 BMPs", Team.Russia),
		new MountedInfantryBattalion([44.021421, 42.658106], 16, [
			{ location: [43.931235, 42.320023] }
		], "70th MR Battalion 2", Team.Russia),
		new BMP2Battalion([44.021421, 42.658106], 30, [
			{ location: [43.931235, 42.320023] }
		], "70th MR Battalion 2 BMPs", Team.Russia),
		new T72Battalion([44.021421, 42.658106], 10, [
			{ location: [43.931235, 42.320023] }
		], "70th Tank Company", Team.Russia),

		new MountedInfantryBattalion([44.020066, 42.653092], 16, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 1", Team.Russia),
		new BMP2Battalion([44.020066, 42.653092], 30, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 1 BMPs", Team.Russia),
		new MountedInfantryBattalion([44.020066, 42.653092], 16, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 2", Team.Russia),
		new BMP2Battalion([44.020066, 42.653092], 30, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 2 BMPs", Team.Russia),
		new MountedInfantryBattalion([44.020066, 42.653092], 16, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 3", Team.Russia),
		new BMP2Battalion([44.020066, 42.653092], 30, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 3 BMPs", Team.Russia),
		new T72Battalion([44.020066, 42.653092], 30, [
			{ location: [43.935778, 42.317001] }
		], "71st Tank Battalion", Team.Russia),

		// new ArtilleryBattalion([44.095118, 42.619849], 18, [
		// 	{ location: [44.116193, 42.562299] },
		// 	{ location: [43.889027, 42.216375] },
		// 	{ location: [43.934431, 42.225161] },
		// 	{ location: [43.958110, 42.221842] },
		// 	{ location: [43.938932, 42.225042] }
		// ], "50th Self-Propelled Artillery Battalion 1", Team.Russia),
		// new ArtilleryBattalion([44.095118, 42.619849], 18, [
		// 	{ location: [44.116193, 42.562299] },
		// 	{ location: [43.889027, 42.216375] },
		// 	{ location: [43.934431, 42.225161] },
		// 	{ location: [43.958110, 42.221842] },
		// 	{ location: [43.938932, 42.225042] }
		// ], "50th Self-Propelled Artillery Battalion 2", Team.Russia),
		// new ArtilleryBattalion([44.095118, 42.619849], 18, [
		// 	{ location: [44.116193, 42.562299] },
		// 	{ location: [43.889027, 42.216375] },
		// 	{ location: [43.934431, 42.225161] },
		// 	{ location: [43.958110, 42.221842] },
		// 	{ location: [43.938932, 42.225042] }
		// ], "50th Self-Propelled Artillery Battalion 3", Team.Russia),

		new MountedInfantryBattalion([44.020066, 42.653092], 8, [
			{ location: [43.935778, 42.317001] }
		], "417th Independent Reconnaissance Battalion", Team.Russia),
		new MountedInfantryBattalion([44.020066, 42.653092], 4, [
			{ location: [43.935778, 42.317001] }
		], "Vostok Battalion", Team.Russia),
		new MountedInfantryBattalion([44.020066, 42.653092], 4, [
			{ location: [43.935778, 42.317001] }
		], "Zapad Battalion", Team.Russia),

		/**Other**/
		new MountedInfantryBattalion([44.020066, 42.653092], 8, [
			{ location: [43.935778, 42.317001] }
		], "10th Indepdendent Spetsnaz Brigade", Team.Russia),
		new MountedInfantryBattalion([44.020066, 42.653092], 8, [
			{ location: [43.935778, 42.317001] }
		], "22nd Indepdendent Spetsnaz Brigade", Team.Russia),
		new MountedInfantryBattalion([44.020066, 42.653092], 8, [
			{ location: [43.935778, 42.317001] }
		], "45th Indepdendent Recon Spetsnaz Regiment", Team.Russia),

		new InfantryBattalion([43.958532, 42.300803], 12, [
		], "104th Air Assault", Team.Russia),
		new InfantryBattalion([43.958532, 42.300803], 12, [
		], "234th Air Assault", Team.Russia),

		/**SOUTH OSSETIA**/

		/**Militia**/
		new T55Battalion([43.962491, 42.211796], 10, [
		], "South Ossetian Tanks", Team.SouthOssetia),
		new InfantryBattalion([43.959390, 42.206754], 4, [
		], "South Ossetian Unit 1", Team.SouthOssetia),
		new InfantryBattalion([43.962491, 42.211796], 8, [
		], "South Ossetian Unit 2", Team.SouthOssetia),
		new InfantryBattalion([44.049107, 42.270518], 6, [
		], "South Ossetian Unit 3", Team.SouthOssetia),
		new InfantryBattalion([43.978487, 42.206198], 24, [
		], "South Ossetian 4th Battalion", Team.SouthOssetia),
		new InfantryBattalion([43.896058, 42.211914], 4, [
		], "South Ossetian Unit 4", Team.SouthOssetia),
		new InfantryBattalion([43.896058, 42.211914], 4, [
		], "South Ossetian Unit 5", Team.SouthOssetia),
		new InfantryBattalion([43.630824, 42.509382], 6, [
		], "South Ossetian Unit 6", Team.SouthOssetia)
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

	const scenarioSlider = document.getElementById("scenario") as HTMLInputElement;
	const scenarioValue = document.getElementById("scenario-value") as HTMLSpanElement;
	let scenarioPercentage: number = 0;

	function initialize() {
		timeElement.textContent = "Initializing...";

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
		dispatcher = new Dispatcher(startDate, units);
		timeElement.textContent = dispatcher.formattedTime;
	}
	scenarioSlider.addEventListener("input", () => {
		scenarioPercentage = parseFloat(scenarioSlider.value);
		scenarioValue.textContent = scenarioPercentage.toString();
		initialize();
	});
	initialize();

	const stopButton = document.getElementById("stop")!;
	const resetButton = document.getElementById("reset")!;
	let shouldStop = true;
	stopButton.addEventListener("click", () => {
		shouldStop = !shouldStop;
		if (!shouldStop) {
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
	resetButton.addEventListener("click", () => {
		isReset = true;
		shouldStop = true;
		if (currentUpdate !== null) {
			window.clearTimeout(currentUpdate);
		}
		stopButton.textContent = "Start";
		resetButton.style.display = "none";
		scenarioSlider.disabled = false;
		initialize();
	})

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

		if (!shouldStop) {
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
