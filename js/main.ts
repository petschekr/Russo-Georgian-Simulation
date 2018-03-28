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
	ArtilleryBattalion,
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
	style: "mapbox://styles/mapbox/outdoors-v9",
	center: [43.968468, 42.218956],
	zoom: 14,
	bearingSnap: 20
});

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

	/**Unit/collection types: InfantryBattalion, InfantryBattalion, ArtilleryBattalion, T72Battalion**/
	return [
		/**GEORGIA**/
		
		/**Peacekeepers**/
		new InfantryBattalion([43.99955749511719, 42.15335057390396], 16, [
		], "Georgian Peacekeeper Battalion", Team.Georgia),
		
		/**West**/
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] }
		], "41st Infantry Battalion", Team.Georgia),
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] }
		], "42nd Infantry Battalion", Team.Georgia),
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.77322196960449, 42.19406111275616] }
		], "43rd Infantry Battalion", Team.Georgia),
		new BTR80Battalion([43.952436447143555, 42.20022901694891], 10, [
			{ location: [43.77322196960449, 42.19406111275616] }
		], "4th BTRs", Team.Georgia),
		new BMP2Battalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.77322196960449, 42.19406111275616] }
		], "4th BMPs", Team.Georgia),
		new T72Battalion([43.952436447143555, 42.20022901694891], 20, [
		], "44th Armored Battalion", Team.Georgia),
		new ArtilleryBattalion([43.952436447143555, 42.20022901694891], 18, [
		], "45th Artillery Battalion", Team.Georgia),
		
		/**East**/
		new InfantryBattalion([44.03217315673828, 42.21046513733562], 16, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "31st Infantry Battalion", Team.Georgia),
		new InfantryBattalion([44.03217315673828, 42.21046513733562], 16, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "32nd Infantry Battalion", Team.Georgia),
		new InfantryBattalion([44.03217315673828, 42.21046513733562], 16, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "33rd Infantry Battalion", Team.Georgia),
		new BTR80Battalion([44.03217315673828, 42.21046513733562], 10, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "3rd BTRs", Team.Georgia),
		new BMP2Battalion([44.03217315673828, 42.21046513733562], 16, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "3rd BMPs", Team.Georgia),
		new T72Battalion([44.03217315673828, 42.21046513733562], 20, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "34th Armored Battalion", Team.Georgia),
		new ArtilleryBattalion([44.03217315673828, 42.21046513733562], 18, [
			{ location: [44.03114318847656, 42.24090937727564] },
			{ location: [44.06041145324707, 42.27502251971017] }
		], "35th Artillery Battalion", Team.Georgia),

		/**Center**/
		new InfantryBattalion([44.03672218322754, 42.177080370547195], 72, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Interior Ministry special task forces", Team.Georgia),
		new CobraBattalion([44.03672218322754, 42.177080370547195], 70, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Interior Ministry special task force Cobras", Team.Georgia),
		new InfantryBattalion([44.03672218322754, 42.177080370547195], 8, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Georgian Special Operations Group", Team.Georgia),
		new InfantryBattalion([44.03672218322754, 42.177080370547195], 16, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Independent Light Infantry Battalion", Team.Georgia),
		new BMP2Battalion([43.96385192871094, 42.163594285679395], 16, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "ICT BMPs", Team.Georgia),
		new T72Battalion([43.96385192871094, 42.163594285679395], 20, [
			{ location: [43.97981643676758, 42.224767496010266] }
		], "Independent Combined Tank Battalion", Team.Georgia),
		
		/**Reserve**/
		new InfantryBattalion([43.99955749511719, 42.15335057390396], 16, [
		], "53rd Infantry Battalion", Team.Georgia),
		new InfantryBattalion([43.99526596069336, 42.196095951813454], 16, [
		], "11th Infantry Battalion", Team.Georgia),
		new ArtilleryBattalion([43.99526596069336, 42.196095951813454], 18, [
		], "15th Artillery Battalion", Team.Georgia),
		
		/**Far West**/
		new InfantryBattalion([43.597354888916016, 42.5045977676146], 16, [
			{ location: [43.631858825683594,  42.509817850023786] }
		], "Interior Ministry Combined Battalion", Team.Georgia),
		new InfantryBattalion([43.59769821166992, 42.36133451106724], 16, [
		], "Independent Mountain Rifle Battalion", Team.Georgia),		

		/**Fire support in Gori**/
		new ArtilleryBattalion([43.99526596069336, 42.196095951813454], 30, [
		], "Self-Propelled Artillery Battalion", Team.Georgia),
		new ArtilleryBattalion([43.99526596069336, 42.196095951813454], 20, [
		], "MRL Battalion 1", Team.Georgia),
		new ArtilleryBattalion([43.99526596069336, 42.196095951813454], 20, [
		], "MRL Battalion 2", Team.Georgia),
		
		/**Reinforcements from Abkhazia**/
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] }
		], "21st Infantry Battalion", Team.Georgia),
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.89261245727539, 42.21211802] },
			{ location: [43.95647048950195, 42.22178015985047] }
		], "22nd Infantry Battalion", Team.Georgia),
		new InfantryBattalion([43.952436447143555, 42.20022901694891], 16, [
			{ location: [43.77322196960449, 42.19406111275616] }
		], "23rd Infantry Battalion", Team.Georgia),
		new BTR80Battalion([43.952436447143555, 42.20022901694891], 10, [
		], "2nd BTRs", Team.Georgia),
		new BMP2Battalion([43.952436447143555, 42.20022901694891], 16, [
		], "2nd BMPs", Team.Georgia),
		new T72Battalion([43.952436447143555, 42.20022901694891], 20, [
		], "24th Armored Battalion", Team.Georgia),
		new ArtilleryBattalion([43.952436447143555, 42.20022901694891], 18, [
		], "25th Artillery Battalion", Team.Georgia),
		
		/**RUSSIA**/
		
		/**Peacekeepers**/
		new InfantryBattalion([43.9671467,42.2279047], 16, [
		], "Russian Peacekeeper Battalion", Team.Russia),
		
		/**19th MR Division**/
		new InfantryBattalion([44.095187, 42.619808], 16, [
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
		new InfantryBattalion([44.095187, 42.619808], 16, [
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
		
		new InfantryBattalion([44.095247, 42.619793], 16, [
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
		new InfantryBattalion([44.095247, 42.619793], 16, [
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
		
		new InfantryBattalion([44.094480, 42.620106], 16, [
			{ location: [43.928737, 42.225538] },
			{ location: [43.956550, 42.221885] }
		], "503rd MR Battalion 1", Team.Russia),
		new BMP2Battalion([44.094480, 42.620106], 30, [
			{ location: [43.928737, 42.225538] },
			{ location: [43.956550, 42.221885] }
		], "503rd MR Battalion 1 BMPs", Team.Russia),
		new InfantryBattalion([44.094480, 42.620106], 16, [
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
		
		new InfantryBattalion([44.095098, 42.619851], 16, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd MR Battalion 1", Team.Russia),
		new BMP2Battalion([44.095098, 42.619851], 30, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd MR Battalion 1 BMPs", Team.Russia),
		new InfantryBattalion([44.095098, 42.619851], 16, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd MR Battalion 2", Team.Russia),
		new BMP2Battalion([44.095098, 42.619851], 30, [
			{ location: [44.117457, 42.563961] },
			{ location: [43.949769, 42.290389] },
			{ location: [43.961421, 42.257837] }
		], "693rd MR Battalion 2 BMPs", Team.Russia),
		new InfantryBattalion([44.095098, 42.619851], 16, [
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
		
		new ArtilleryBattalion([44.095118, 42.619849], 18, [
			{ location: [44.116193, 42.562299] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934431, 42.225161] },
			{ location: [43.958110, 42.221842] },
			{ location: [43.938932, 42.225042] }
		], "292nd Self-Propelled Artillery Battalion 1", Team.Russia),
		new ArtilleryBattalion([44.095118, 42.619849], 18, [
			{ location: [44.116193, 42.562299] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934431, 42.225161] },
			{ location: [43.958110, 42.221842] },
			{ location: [43.938932, 42.225042] }
		], "292nd Self-Propelled Artillery Battalion 2", Team.Russia),
		new ArtilleryBattalion([44.095118, 42.619849], 18, [
			{ location: [44.116193, 42.562299] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934431, 42.225161] },
			{ location: [43.958110, 42.221842] },
			{ location: [43.938932, 42.225042] }
		], "292nd Self-Propelled Artillery Battalion 3", Team.Russia),
		
		new T72Battalion([44.095118, 42.619849], 30, [
			{ location: [44.116193, 42.562299] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934431, 42.225161] },
			{ location: [43.958110, 42.221842] },
			{ location: [43.938932, 42.225042] }
		], "141st Independent Tank Battalion", Team.Russia),
		
		/**42nd MR Division**/
		new InfantryBattalion([44.021421, 42.658106], 16, [
			{ location: [43.931235, 42.320023] }
		], "70th MR Battalion 1", Team.Russia),
		new BMP2Battalion([44.021421, 42.658106], 30, [
			{ location: [43.931235, 42.320023] }
		], "70th MR Battalion 1 BMPs", Team.Russia),
		new InfantryBattalion([44.021421, 42.658106], 16, [
			{ location: [43.931235, 42.320023] }
		], "70th MR Battalion 2", Team.Russia),
		new BMP2Battalion([44.021421, 42.658106], 30, [
			{ location: [43.931235, 42.320023] }
		], "70th MR Battalion 2 BMPs", Team.Russia),
		new T72Battalion([44.021421, 42.658106], 10, [
			{ location: [43.931235, 42.320023] }
		], "70th Tank Company", Team.Russia),
		
		new InfantryBattalion([44.020066, 42.653092], 16, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 1", Team.Russia),
		new BMP2Battalion([44.020066, 42.653092], 30, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 1 BMPs", Team.Russia),
		new InfantryBattalion([44.020066, 42.653092], 16, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 2", Team.Russia),
		new BMP2Battalion([44.020066, 42.653092], 30, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 2 BMPs", Team.Russia),
		new InfantryBattalion([44.020066, 42.653092], 16, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 3", Team.Russia),
		new BMP2Battalion([44.020066, 42.653092], 30, [
			{ location: [43.935778, 42.317001] }
		], "71st MR Battalion 3 BMPs", Team.Russia),
		new T72Battalion([44.020066, 42.653092], 30, [
			{ location: [43.935778, 42.317001] }
		], "71st Tank Battalion", Team.Russia),
		
		new ArtilleryBattalion([44.095118, 42.619849], 18, [
			{ location: [44.116193, 42.562299] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934431, 42.225161] },
			{ location: [43.958110, 42.221842] },
			{ location: [43.938932, 42.225042] }
		], "50th Self-Propelled Artillery Battalion 1", Team.Russia),
		new ArtilleryBattalion([44.095118, 42.619849], 18, [
			{ location: [44.116193, 42.562299] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934431, 42.225161] },
			{ location: [43.958110, 42.221842] },
			{ location: [43.938932, 42.225042] }
		], "50th Self-Propelled Artillery Battalion 2", Team.Russia),
		new ArtilleryBattalion([44.095118, 42.619849], 18, [
			{ location: [44.116193, 42.562299] },
			{ location: [43.889027, 42.216375] },
			{ location: [43.934431, 42.225161] },
			{ location: [43.958110, 42.221842] },
			{ location: [43.938932, 42.225042] }
		], "50th Self-Propelled Artillery Battalion 3", Team.Russia),
		
		/**Other**/
		new InfantryBattalion([44.020066, 42.653092], 4, [
			{ location: [43.935778, 42.317001] }
		], "Vostok Battalion", Team.Russia),
		new InfantryBattalion([44.020066, 42.653092], 4, [
			{ location: [43.935778, 42.317001] }
		], "Zapad Battalion", Team.Russia),
		
		new InfantryBattalion([44.020066, 42.653092], 8, [
			{ location: [43.935778, 42.317001] }
		], "10th Indepdendent Spetsnaz Brigade", Team.Russia),
		new InfantryBattalion([44.020066, 42.653092], 8, [
			{ location: [43.935778, 42.317001] }
		], "22nd Indepdendent Spetsnaz Brigade", Team.Russia),
		new InfantryBattalion([44.020066, 42.653092], 8, [
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
