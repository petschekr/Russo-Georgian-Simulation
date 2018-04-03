import { Vector2, Waypoint, Entity, Team, NAVIGATION_THRESHOLD, Utilities } from "./common";
import { Unit, TankT55, Cobra, BTR80, TankT62, TankT72, ArtilleryD30, ArtilleryDANA, Akatsiya, MRLGrad, BMP2, InfantrySquad, MountedInfantrySquad } from "./units";
import { UnitType } from "./weapons";
import { getDirections, terrainAlongLine, TerrainReturn, LandCover } from "./mapdata";
import { map, dispatcher } from "./main";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

type GeoFeature<T> = _turf.helpers.Feature<T, _turf.helpers.Properties>;

// Speeds things up at the cost of a slightly less accurate simulation
const SINGLE_UNIT_MODE = true;

// Groups of infantry, tanks, etc.
export abstract class AgentCollection<T extends Unit> implements Entity {
	private static instances: AgentCollection<Unit>[] = [];

	public readonly id: string;
	public abstract readonly type: UnitType;
	public readonly team: Team;
	public eliminated: boolean = false;

	public waypoints: Waypoint[];
	public intermediatePoints: Vector2[];
	private navigationCalculated: boolean = false;
	private navigating : boolean = false;

	public units: T[] = [];

	private visibilityArea: GeoFeature<_turf.helpers.Polygon> = turf.polygon([[[0, 0], [0, 0], [0, 0], [0, 0]]]);
	public maxVisibilityRange: number = 0;

	// Get centroid location average of all included units
	private locationCache: Vector2 = this.defaultLocation;
	get location(): Vector2 {
		if (this.units.length === 0) {
			return this.locationCache;
		}
		let x = 0;
		let y = 0;
		for (let unit of this.units) {
			x += unit.location[0];
			y += unit.location[1];
		}
		x /= this.units.length;
		y /= this.units.length;
		
		this.locationCache = [x, y]
		return this.locationCache;
	}

	get health(): number {
		if (this.units.length === 0) {
			return 0;
		}
		let health = 0;
		for (let unit of this.units) {
			health += unit.health;
		}
		return health / this.units.length;
	}

	constructor(id: string, team: Team, private readonly defaultLocation: Vector2, waypoints: Waypoint[]) {
		AgentCollection.instances.push(this);
		this.id = id.replace(/ /g, "_");
		this.team = team;
		this.waypoints = waypoints;
		if (this.waypoints.length === 0) {
			this.waypoints = [{ location: this.location }];
		}
		this.intermediatePoints = [this.location, this.location];
	}

	protected setUp(unit: new(location: Vector2, container: AgentCollection<Unit>) => T, unitNumber: number, location: Vector2) {
		if (!SINGLE_UNIT_MODE) {
			for (let i = 0; i < unitNumber; i++) {
				this.units.push(new unit(location, this));
			}
			if (this.units.length > 0) {
				this.maxVisibilityRange = this.units[0].visibility.range;
			}
			else {
				this.maxVisibilityRange = 0;
			}
		}
		else {
			this.units = [new unit(location, this)];
			this.units[0].enableSingleUnitMode(unitNumber);
			this.maxVisibilityRange = this.units[0].visibility.range;
		}
	}

	// Navigation occurs on the unit collection level and instructions get
	// propogated downwards to the individual units
	private currentTerrain: TerrainReturn[] = [];
	public get _currentTerrain() { return this.currentTerrain; }
	private currentGrade: number = 0;
	private async calculateNavigation(): Promise<void> {
		if (this.waypoints.length <= 0) {
			return;
		}
		
		let next = this.waypoints[0];
		this.intermediatePoints = await getDirections(this.location, next.location, this.type);
		let intermediatePath = turf.lineString(this.intermediatePoints);

		const terrainSample = 500; // meters
		this.currentTerrain = await terrainAlongLine(intermediatePath, terrainSample);
		let heightDiffs = this.currentTerrain.map(terrain => terrain.elevation).map((ele, i, arr) => Math.abs(ele - arr[i - 1])).slice(1);
		// Don't take really inefficient paths
		const inefficientPathFactor = 2.5;
		if (turf.length(intermediatePath) > turf.distance(this.location, next.location) * inefficientPathFactor) {
			// Check if direct path is too steep
			if (Math.max(...heightDiffs) / terrainSample <= this.units[0].maxClimbAbility) {
				// Set path to be direct
				this.intermediatePoints = [this.location, next.location];
				intermediatePath = turf.lineString(this.intermediatePoints);
			}
			else {
				console.warn("Taking long route because max steepness along route is too high");
			}
		}

		dispatcher.layerData.get(this.team)!.path.set(this.id, intermediatePath);
		
		let allCoords = turf.getCoords(intermediatePath);
		let start = allCoords[0] as Vector2;
		let end = allCoords[allCoords.length - 1] as Vector2;
		let distance = turf.distance(start, end, { units: "meters" });

		// Rise / run
		let elevation1 = this.currentTerrain[0].elevation;
		let elevation2 = this.currentTerrain[this.currentTerrain.length - 1].elevation;
		this.currentGrade = 0;
		if (elevation1 !== null && elevation2 !== null) {
			this.currentGrade = Math.abs(elevation2 - elevation1) / distance;
			// 0 / 0 when duplicate waypoints exist
			if (isNaN(this.currentGrade)) {
				this.currentGrade = 0;
			}
			console.log(`Calculated grade for computed route (${elevation2 - elevation1} / ${distance}):`, this.currentGrade.toFixed(2));
		}

		this.navigationCalculated = true;
	}

	private unitsFinishedNavigating: boolean = false;
	public async tick(secondsElapsed: number): Promise<void> {
		if (this.units.length === 0) {
			this.eliminated = true;
			this.waypoints = [];
			// Hide collection
			dispatcher.layerData.get(this.team)!.location.set(this.id, turf.point(this.location));
			dispatcher.layerData.get(this.team)!.path.delete(this.id);
			dispatcher.layerData.get(this.team)!.units.delete(this.id);
			dispatcher.layerData.get(this.team)!.visibility.delete(this.id);
			dispatcher.layerData.get(this.team)!.waypoints.delete(this.id);
		}
		if (this.eliminated) return;

		if (this.waypoints[0] && this.unitsFinishedNavigating) {
			// Destination reached (all units no longer traveling)
			this.waypoints.shift();
			this.unitsFinishedNavigating = false;
			this.navigationCalculated = false;
			this.navigating = false;
			if (this.waypoints.length === 0) {
				console.log(`${this.id} is done with navigation!`);
				// Hide intermediate points path
				dispatcher.layerData.get(this.team)!.path.delete(this.id);
			}
			else {
				console.log(`${this.id} moving to next objective. ${this.waypoints.length - 1} remaining.`);
			}
		}
		if (!this.navigating && !this.navigationCalculated) {
			await this.calculateNavigation();
		}
		if (!this.navigating && this.navigationCalculated) {
			for (let unit of this.units) {
				unit.updatePath(this.intermediatePoints, this.waypoints[0]);
			}
			this.navigating = true;
		}

		// Tick through subunits
		let finishedNavigation = 0;
		let unitVisibilties: GeoFeature<_turf.helpers.Polygon>[] = [];
		if (this.currentTerrain.length > 0) {
			if (this.currentTerrain[1] && Utilities.fastDistance(this.location, this.currentTerrain[0].location) >= Utilities.fastDistance(this.location, this.currentTerrain[1].location)) {
				// Point reached, move on
				this.currentTerrain.shift();
			}
		}
		for (let unit of this.units) {
			if (this.navigating) {
				if (this.currentTerrain.length > 0) {
					unit.setSpeedForTerrain(this.currentGrade, this.currentTerrain[0].type);
				}
				if (unit.navigate(secondsElapsed)) {
					finishedNavigation++;
				}
			}
			//unitVisibilties.push(turf.circle(unit.location, unit.visibility.range, { units: "meters" }));
			unit.tick(secondsElapsed);
		}
		this.unitsFinishedNavigating = this.units.length === finishedNavigation;
		// Disabled for performance concerns
		//this.visibilityArea = turf.union(...unitVisibilties);
		this.visibilityArea = turf.circle(this.location, this.maxVisibilityRange, { units: "meters" });

		await this.prepareCombat();
		await this.combat(secondsElapsed);

		// Update visualizations on map
		dispatcher.layerData.get(this.team)!.location.set(this.id, turf.point(this.location));
		dispatcher.layerData.get(this.team)!.units.set(this.id, turf.multiPoint(this.units.map(unit => unit.location)));
		if (this.waypoints.length > 0) {
			dispatcher.layerData.get(this.team)!.waypoints.set(
				this.id,
				turf.lineString([this.location, ...this.waypoints.map(waypoint => waypoint.location)])
			);
		}
		else {
			dispatcher.layerData.get(this.team)!.waypoints.delete(this.id);
		}
		dispatcher.layerData.get(this.team)!.visibility.set(this.id, this.visibilityArea);
	}

	private static areBadOdds(me: AgentCollection<Unit>, them: AgentCollection<Unit>): boolean {
		return ((me.type === UnitType.Infantry || me.type === UnitType.UnarmoredVehicle)
				&& them.type === UnitType.HeavyArmor
				&& me.units.length < them.units.length * 3)
			|| (me.type === UnitType.HeavyArmor
				&& (them.type === UnitType.Infantry || them.type === UnitType.UnarmoredVehicle)
				&& me.units.length < them.units.length * 0.5)
	}

	private detectedCollections = new Set<AgentCollection<Unit>>();
	protected engagingBecauseDamaged = false;
	private _engagingCollection: AgentCollection<Unit> | null = null;
	protected get engagingCollection(): AgentCollection<Unit> | null {
		return this._engagingCollection;
	}
	protected set engagingCollection(collection: AgentCollection<Unit> | null) {
		this._engagingCollection = collection;
		if (!collection) {
			this.unitsFinishedNavigating = true;
			this.engagingBecauseDamaged = false;
			this.retreating = false;
		}
		for (let unit of this.units) {
			if (this.engagingBecauseDamaged) {
				unit.isEngaging = false; // Don't speed limit when retreating
			}
			else {
				unit.isEngaging = !!collection;
			}
		}
	}

	private async prepareCombat(): Promise<void> {
		if (this.retreating && !this.engagingCollection) {
			this.retreating = false;
		}
		if (this.retreating && !turf.booleanPointInPolygon(this.location, this.engagingCollection!.visibilityArea)) {
			this.retreating = false;
			this.engagingCollection = null;
		}
		if (this.retreating) return;

		const detectionThreshold = 0.7;
		const spreadDistance = 300; // meters
		const recalculateDistance = 200; // meters;

		let otherCollections = AgentCollection.instances.filter(instance => instance.id !== this.id && Utilities.isEnemy(this.team, instance.team));
		for (let collection of otherCollections) {
			if (
				!collection.eliminated
				&& turf.booleanPointInPolygon(collection.location, this.visibilityArea)
				&& Math.random() * (this.maxVisibilityRange / turf.distance(this.location, collection.location, { units: "meters" })) > detectionThreshold
			) {
				if (this.detectedCollections.has(collection)) {
					continue;
				}
				// Detected another unit
				if (AgentCollection.areBadOdds(this, collection)) {
					continue;
				}
				this.detectedCollections.add(collection);
				console.warn("Detected collection:", collection.id);
			}
			else if (collection.eliminated || !turf.booleanPointInPolygon(collection.location, this.visibilityArea) && !this.engagingBecauseDamaged) {
				// Remove unit from detected
				this.detectedCollections.delete(collection);
				if (collection === this.engagingCollection) {
					this.engagingCollection = null;
				}
			}
			else if (
				this.engagingBecauseDamaged
				&& this.engagingCollection
				&& !this.engagingCollection.eliminated
				&& turf.distance(this.location, this.engagingCollection.location, { units: "meters" }) > this.engagingCollection.maxVisibilityRange
			) {
				this.detectedCollections.delete(this.engagingCollection);
				this.engagingCollection = null;
			}
		}

		// Share detected locations
		dispatcher.updateDetectedCollections(this.team, this.detectedCollections);

		let closestCollection: AgentCollection<Unit> | undefined;
		let closestCollectionDistance: number = Infinity;
		this.detectedCollections.forEach(collection => {
			let distance = turf.distance(this.location, collection.location);
			if (distance < closestCollectionDistance) {
				closestCollection = collection;
				closestCollectionDistance = distance;
			}
		});
		if (this.engagingBecauseDamaged) {
			closestCollection = this.engagingCollection!;
		}
		if (!closestCollection) return;
		if (this.waypoints[0] && turf.distance(this.waypoints[0].location, closestCollection.location, { units: "meters" }) < spreadDistance + recalculateDistance) return;

		let bearingTargetToMe = turf.bearing(closestCollection.location, this.location);
		const spread = 120; // degrees
		let spreadLine = turf.lineArc(
			turf.point(closestCollection.location),
			spreadDistance / 1000, // Input in kilometers because of https://github.com/Turfjs/turf/issues/1310
			bearingTargetToMe - spread / 2,
			bearingTargetToMe + spread / 2,
		);
		let spreadLineLength = turf.length(spreadLine, { units: "meters" });
		let navigationLocation = turf.centroid(spreadLine);
		
		if (this.waypoints[0] && this.waypoints[0].temporary) {
			this.waypoints.shift();
		}
		this.waypoints.unshift({ location: Utilities.pointToVector(navigationLocation), temporary: true });
		this.navigating = false;
		this.navigationCalculated = false;
		await this.calculateNavigation();
		// Distribute new path to subunits and include their part of the arc
		for (let [i, unit] of this.units.entries()) {
			unit.updatePath([
				...this.intermediatePoints,
				Utilities.pointToVector(turf.along(spreadLine, spreadLineLength / this.units.length * i, { units: "meters" }))
			], this.waypoints[0]);
		}
		this.navigating = true;
		this.engagingCollection = closestCollection;
	}

	protected retreating = false;
	private async combat(secondsElapsed: number): Promise<void> {
		if (!this.engagingCollection) return;
		if (this.engagingCollection.health <= 0) {
			this.engagingCollection = null;
			return;
		}
		if (this.retreating) return;
		// Retreat if bad odds
		if (AgentCollection.areBadOdds(this, this.engagingCollection) && !this.retreating) {
			console.warn(`Retreating due to bad odds: ${this.id}`);
			this.retreating = true;
		}
			
		if (!this.retreating) {
			console.log("Engaging:", this.engagingCollection.id);
			for (let unit of this.units) {
				let engageSuccess = unit.engage(this.engagingCollection, secondsElapsed);
				if (!engageSuccess) {
					this.retreating = true;
					console.warn(`Retreating because under fire but no way to strike back: ${this.id}`);
				}
			}
		}

		if (this.retreating) {
			let detectionRange = this.engagingCollection.maxVisibilityRange;
			let bearingThemToMe = turf.bearing(this.engagingCollection.location, this.location);

			let distanceBetween = turf.distance(this.location, this.engagingCollection.location, { units: "meters" });
			let backOffDistance = (detectionRange - distanceBetween) * 1.25;
			let destination = turf.destination(this.location, backOffDistance, bearingThemToMe, { units: "meters" });
			
			if (this.waypoints[0] && this.waypoints[0].temporary) {
				this.waypoints.shift();
			}
			this.waypoints.unshift({ location: Utilities.pointToVector(destination), temporary: true });

			// Remap waypoints around enemy visibility area
			if (this.waypoints.length > 0) {
				// Bearings 0 and 0 form a circle
				let around = turf.lineArc(this.engagingCollection.location, detectionRange * 1.25 / 1000, 0, 0);
				for (let [i, waypoint] of this.waypoints.entries()) {
					if (turf.booleanPointInPolygon(waypoint.location, this.engagingCollection.visibilityArea)) {
						// Remap point to outside circle
						this.waypoints[i].location = Utilities.pointToVector(turf.nearestPointOnLine(around, waypoint.location, { units: "meters" }));
					}
				}
			}
			// Don't take a longer route after remapping
			if (this.waypoints.length >= 2 && Utilities.fastDistance(this.location, this.waypoints[0].location) > Utilities.fastDistance(this.location, this.waypoints[1].location)) {
				this.waypoints.shift();
			}
			// if (this.waypoints[0]) {
			// 	let bearingThemToDest = turf.bearing(this.engagingCollection.location, this.waypoints[0].location);
			// 	let around = turf.lineArc(this.engagingCollection.location, detectionRange * 1.25 / 1000, bearingThemToMe, bearingThemToDest);
			// 	// Take off non-applicable starting point
			// 	this.waypoints.shift();
			// 	turf.coordEach(around, p => {
			// 		this.waypoints.unshift({ location: p as Vector2 });
			// 	});
			// }

			
			this.navigating = false;
			this.navigationCalculated = false;
		}
	}

	public damage(source: AgentCollection<Unit>, percentage: number): boolean {
		if (
			!this.engagingCollection 
			|| !this.engagingBecauseDamaged
			// Set different target only if taking damage from a closer collection
			|| Utilities.fastDistance(this.location, source.location) < Utilities.fastDistance(this.location, this.engagingCollection.location)
		) {
			this.engagingBecauseDamaged = true;
			this.engagingCollection = source;
		}

		const damageStep = 1;
		// Distribute damage randomly among units
		for (let i = 0; i < percentage; i += damageStep) {
			if (this.units.length === 0) {
				this.eliminated = true;
				break;
			}
			let index = Utilities.randomInt(0, this.units.length - 1);
			this.units[index].health -= damageStep;
			if (this.units[index].health <= 0) {
				// Unit is dead
				this.units.splice(index, 1);
			}
		}
		return this.eliminated;
	}

	// public split(numberPerGroup: number[]): this[] {
	// 	let collections: this[] = [];
	// 	let currentCollection: T[] = [];
	// 	let currentIndex = 0;
	// 	for (let size of numberPerGroup) {
	// 		collections.push(new (this)(this.units.slice(currentIndex, currentIndex + size)));
	// 		currentIndex += size;
	// 	}
	// 	return collections;
	// }
	// public splitEvenly(groups: number): this[] {
	// 	let numberPerGroup = Math.floor(this.units.length / groups);
	// 	// For numbers of units that don't divide evenly
	// 	let firstUnitAdditional = this.units.length % groups;

	// 	let groupSizes: number[] = [];
	// 	for (let i = 0; i < groups; i++) {
	// 		if (i === 0) {
	// 			groupSizes[i] = firstUnitAdditional + numberPerGroup;
	// 		}
	// 		else {
	// 			groupSizes[i] = numberPerGroup;
	// 		}
	// 	}
	// 	return this.split(groupSizes);
	// }
}

export class InfantryBattalion extends AgentCollection<InfantrySquad> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `InfantryBattalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);

		this.type = UnitType.Infantry;

		this.setUp(InfantrySquad, unitNumber, location);
	}
}

export class MountedInfantryBattalion extends AgentCollection<MountedInfantrySquad> {
	// Determine type based on if in combat
	public get type(): UnitType {
		if (this.engagingCollection && !this.retreating) {
			return UnitType.Infantry;
		}
		else {
			return UnitType.UnarmoredVehicle;
		}
	}

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `MountedInfBattalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);

		this.setUp(MountedInfantrySquad, unitNumber, location);
	}
}

export class CobraBattalion extends AgentCollection<Cobra> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `CobraBattalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);
		
		this.type = UnitType.LightArmor;
		
		this.setUp(Cobra, unitNumber, location);
	}
}

export class BTR80Battalion extends AgentCollection<BTR80> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `BTR80Battalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);
		
		this.type = UnitType.LightArmor;
		
		this.setUp(BTR80, unitNumber, location);
	}
}

export class BMP2Battalion extends AgentCollection<BMP2> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `BMP2Battalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);
		
		this.type = UnitType.LightArmor;
		
		this.setUp(BMP2, unitNumber, location);
	}
}

export class T55Battalion extends AgentCollection<TankT55> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `T55Battalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);
		
		this.type = UnitType.HeavyArmor;
		
		this.setUp(TankT55, unitNumber, location);
	}
}

export class T62Battalion extends AgentCollection<TankT62> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `T62Battalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);
		
		this.type = UnitType.HeavyArmor;

		this.setUp(TankT62, unitNumber, location);
	}
}

export class T72Battalion extends AgentCollection<TankT72> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `T72Battalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);
		
		this.type = UnitType.HeavyArmor;
		
		this.setUp(TankT72, unitNumber, location);
	}
}

export class D30Battalion extends AgentCollection<ArtilleryD30> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `D30Battalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);
		
		this.type = UnitType.UnarmoredVehicle;
		
		this.setUp(ArtilleryD30, unitNumber, location);
	}
}

export class DANABattalion extends AgentCollection<ArtilleryDANA> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `DANABattalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);
		
		this.type = UnitType.UnarmoredVehicle;
		
		this.setUp(ArtilleryDANA, unitNumber, location);
	}
}

export class AkatsiyaBattalion extends AgentCollection<Akatsiya> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `AkatsiyaBattalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);
		
		this.type = UnitType.UnarmoredVehicle;

		this.setUp(Akatsiya, unitNumber, location);
	}
}

export class MRLBattalion extends AgentCollection<MRLGrad> {
	public readonly type: UnitType;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		let id = `ArtilleryBattalion_${Team[team]}_${name}`;
		super(id, team, location, waypoints);
		
		this.type = UnitType.UnarmoredVehicle;

		this.setUp(MRLGrad, unitNumber, location);
	}
}
