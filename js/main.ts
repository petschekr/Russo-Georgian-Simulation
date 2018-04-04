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
				{ location: [43.95838022232056, 42.22184372166598] }
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

	const scenarioSlider = document.getElementById("scenario") as HTMLInputElement;
	const scenarioValue = document.getElementById("scenario-value") as HTMLSpanElement;
	let scenarioPercentage: number = 0;

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
		dispatcher = new Dispatcher(startDate, units);
		timeElement.textContent = dispatcher.formattedTime;
		outputArea.value = "";
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
