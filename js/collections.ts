import { Vector2, Waypoint, Entity, Team, NAVIGATION_THRESHOLD, Utilities } from "./common";
import { Unit, TankT55, Cobra, BTR80, TankT62, TankT72, ArtilleryD30, ArtilleryDANA, Akatsiya, MRLGrad, BMP2, InfantrySquad, MountedInfantrySquad } from "./units";
import { UnitType } from "./weapons";
import { getDirections, terrainAlongLine, TerrainReturn, LandCover } from "./mapdata";
import { map, dispatcher, DEBUGGING } from "./main";

import * as _turf from "@turf/turf";
declare const turf: typeof _turf;

type GeoFeature<T> = _turf.helpers.Feature<T, _turf.helpers.Properties>;

// Speeds things up at the cost of a slightly less accurate simulation
const SINGLE_UNIT_MODE = true;

// Groups of infantry, tanks, etc.
export abstract class AgentCollection<T extends Unit> implements Entity {
	public static instances: AgentCollection<Unit>[] = [];

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

	get maxWeaponRange(): number {
		if (this.units.length === 0) {
			return this.maxVisibilityRange;
		}
		return Math.max(...this.units[0].weapons.map(weapon => weapon[0].range));
	}
	public maxHealth: number = NaN;
	public maxUnitNumber: number = 0;
	public abstract readonly crew: number;

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
				this.maxHealth = this.units[0].maxHealth;
			}
			else {
				this.maxVisibilityRange = 0;
				this.maxHealth = 0;
			}
		}
		else {
			this.units = [new unit(location, this)];
			this.units[0].enableSingleUnitMode(unitNumber);
			this.maxVisibilityRange = this.units[0].visibility.range;
			this.maxHealth = this.units[0].maxHealth;
		}
		this.maxUnitNumber = unitNumber;
	}

	// Navigation occurs on the unit collection level and instructions get
	// propogated downwards to the individual units
	private currentTerrain: TerrainReturn[] = [];
	private currentGrade: number = 0;
	private heightDiffs: number[] = [0];
	public get _currentTerrain() { return this.currentTerrain; }
	public get _currentGrade() { return this.currentGrade; }
	public get _currentSpeed() { return this.units.length > 0 ? this.units[0].speed : 0; }
	private async calculateNavigation(): Promise<void> {
		if (this.waypoints.length <= 0) {
			return;
		}
		
		let next = this.waypoints[0];

		let intermediatePath: _turf.Feature<_turf.LineString> = turf.lineString([this.location, this.location]);
		const terrainSample = 1000; // meters

		const bestDirections = async (type: UnitType = this.type) => {
			this.intermediatePoints = await getDirections(this.location, next.location, type);
			intermediatePath = turf.lineString(this.intermediatePoints);
			this.currentTerrain = await terrainAlongLine(intermediatePath, terrainSample);
			this.heightDiffs = this.currentTerrain.map(terrain => terrain.elevation).map((ele, i, arr) => Math.abs(ele - arr[i - 1])).slice(1);
		}
		await bestDirections();

		// Don't take really inefficient paths
		const inefficientPathFactor = 2.5;
		const isInefficient = () => turf.length(intermediatePath) > turf.distance(this.location, next.location) * inefficientPathFactor;
		if (isInefficient()) {
			// Switch to walking directions to check if that's faster
			await bestDirections(UnitType.None);
			if (isInefficient()) {
				// Check if direct path is too steep
				if (Math.max(...this.heightDiffs) / terrainSample <= this.units[0].maxClimbAbility) {
					// Set path to be direct
					this.intermediatePoints = [this.location, next.location];
					intermediatePath = turf.lineString(this.intermediatePoints);
				}
				else if (DEBUGGING) {
					console.warn(`Taking long route because max steepness along route is too high (${this.id})`);
				}
			}
			else if (DEBUGGING) {
				console.info(`Using walking directions instead of driving due to inefficiency (${this.id})`);
			}
		}

		let length = Utilities.fastDistance(this.currentTerrain[0].location, this.currentTerrain[1].location);
		this.currentGrade = this.heightDiffs[0] / length;
		if (length < 50) {
			// For very short segments (< 50 meters) set grade to 0 so that it doesn't get exaggerated by small changes in elevation
			this.currentGrade = 0;
		}

		if (DEBUGGING) {
			console.log(`Calculated navigation for route of ${turf.length(intermediatePath).toFixed(1)} km`);
		}

		dispatcher.layerData.get(this.team)!.path.set(this.id, intermediatePath);
		
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
				// Hide intermediate points path
				dispatcher.layerData.get(this.team)!.path.delete(this.id);
			}
			else if (DEBUGGING) {
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
			while (
				this.currentTerrain[1] && this.currentTerrain[2]
				&& this.units.length > 0
				&& !Utilities.pointOnLine(this.currentTerrain[1].location, this.units[0].path)
			) {
				// Point reached, move on
				let length = Utilities.fastDistance(this.currentTerrain[1].location, this.currentTerrain[2].location);
				this.currentTerrain.shift();
				this.heightDiffs.shift();
				this.currentGrade = this.heightDiffs[0] / length;
				if (length < 50) {
					// For very short segments (< 50 meters) set grade to 0 so that it doesn't get exaggerated by small changes in elevation
					this.currentGrade = 0;
				}
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
		this.visibilityArea = turf.circle(this.location, this.maxVisibilityRange, { units: "meters", steps: 20 });

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
		const recalculateDistance = Math.min(this.maxVisibilityRange / 2, this.maxWeaponRange); // meters

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
				if (DEBUGGING) {
					console.warn("Detected collection:", collection.id);
				}
			}
			else if (collection.eliminated || (!turf.booleanPointInPolygon(collection.location, this.visibilityArea) && !this.engagingBecauseDamaged)) {
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
		if (this.waypoints[0] && Utilities.fastDistance(this.waypoints[0].location, closestCollection.location) < recalculateDistance) return;

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
			if (SINGLE_UNIT_MODE) {
				unit.updatePath(this.intermediatePoints, this.waypoints[0]);
			}
			else {
				unit.updatePath([
					...this.intermediatePoints,
					Utilities.pointToVector(turf.along(spreadLine, spreadLineLength / this.units.length * i, { units: "meters" }))
				], this.waypoints[0]);
			}
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
		// Retreat if bad odds
		if (AgentCollection.areBadOdds(this, this.engagingCollection) && !this.retreating) {
			if (DEBUGGING) {
				console.warn(`Retreating due to bad odds: ${this.id}`);
			}
			this.retreating = true;
		}
			
		if (!this.retreating) {
			if (DEBUGGING) {
				console.log("Engaging:", this.engagingCollection.id);
			}
			for (let unit of this.units) {
				let engageSuccess = unit.engage(this.engagingCollection, secondsElapsed);
				if (!engageSuccess && this.engagingBecauseDamaged) {
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
				for (let waypoint of this.waypoints) {
					if (turf.booleanPointInPolygon(waypoint.location, this.engagingCollection.visibilityArea)) {
						let bearing = turf.bearing(this.engagingCollection.location, waypoint.location);
						let distance = turf.distance(this.engagingCollection.location, waypoint.location, { units: "meters" });
						waypoint.location = Utilities.pointToVector(turf.destination(waypoint.location, (detectionRange - distance) * 1.25, bearing, { units: "meters" }));
					}
				}
			}
			
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
	public readonly crew = InfantrySquad.memberCount;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`InfantryBattalion_${Team[team]}_${name}`, team, location, waypoints);

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
	public readonly crew = MountedInfantrySquad.memberCount;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`MountedInfBattalion_${Team[team]}_${name}`, team, location, waypoints);

		this.setUp(MountedInfantrySquad, unitNumber, location);
	}
}

export class CobraBattalion extends AgentCollection<Cobra> {
	public readonly type: UnitType;
	public readonly crew = 7;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`CobraBattalion_${Team[team]}_${name}`, team, location, waypoints);
		
		this.type = UnitType.LightArmor;
		
		this.setUp(Cobra, unitNumber, location);
	}
}

export class BTR80Battalion extends AgentCollection<BTR80> {
	public readonly type: UnitType;
	public readonly crew = 3;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`BTR80Battalion_${Team[team]}_${name}`, team, location, waypoints);
		
		this.type = UnitType.LightArmor;
		
		this.setUp(BTR80, unitNumber, location);
	}
}

export class BMP2Battalion extends AgentCollection<BMP2> {
	public readonly type: UnitType;
	public readonly crew = 3;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`BMP2Battalion_${Team[team]}_${name}`, team, location, waypoints);
		
		this.type = UnitType.LightArmor;
		
		this.setUp(BMP2, unitNumber, location);
	}
}

export class T55Battalion extends AgentCollection<TankT55> {
	public readonly type: UnitType;
	public readonly crew = 4;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`T55Battalion_${Team[team]}_${name}`, team, location, waypoints);
		
		this.type = UnitType.HeavyArmor;
		
		this.setUp(TankT55, unitNumber, location);
	}
}

export class T62Battalion extends AgentCollection<TankT62> {
	public readonly type: UnitType;
	public readonly crew = 4;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`T62Battalion_${Team[team]}_${name}`, team, location, waypoints);
		
		this.type = UnitType.HeavyArmor;

		this.setUp(TankT62, unitNumber, location);
	}
}

export class T72Battalion extends AgentCollection<TankT72> {
	public readonly type: UnitType;
	public readonly crew = 3;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`T72Battalion_${Team[team]}_${name}`, team, location, waypoints);
		
		this.type = UnitType.HeavyArmor;
		
		this.setUp(TankT72, unitNumber, location);
	}
}

export class D30Battalion extends AgentCollection<ArtilleryD30> {
	public readonly type: UnitType;
	public readonly crew = 3;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`D30Battalion_${Team[team]}_${name}`, team, location, waypoints);
		
		this.type = UnitType.UnarmoredVehicle;
		
		this.setUp(ArtilleryD30, unitNumber, location);
	}
}

export class DANABattalion extends AgentCollection<ArtilleryDANA> {
	public readonly type: UnitType;
	public readonly crew = 3;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`DANABattalion_${Team[team]}_${name}`, team, location, waypoints);
		
		this.type = UnitType.UnarmoredVehicle;
		
		this.setUp(ArtilleryDANA, unitNumber, location);
	}
}

export class AkatsiyaBattalion extends AgentCollection<Akatsiya> {
	public readonly type: UnitType;
	public readonly crew = 4;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`AkatsiyaBattalion_${Team[team]}_${name}`, team, location, waypoints);
		
		this.type = UnitType.UnarmoredVehicle;

		this.setUp(Akatsiya, unitNumber, location);
	}
}

export class MRLBattalion extends AgentCollection<MRLGrad> {
	public readonly type: UnitType;
	public readonly crew = 3;

	constructor(location: Vector2, unitNumber: number, waypoints: Waypoint[], name: string, team: Team) {
		super(`MRLBattalion_${Team[team]}_${name}`, team, location, waypoints);
		
		this.type = UnitType.UnarmoredVehicle;

		this.setUp(MRLGrad, unitNumber, location);
	}
}
