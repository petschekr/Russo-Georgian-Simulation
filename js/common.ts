import * as _turf from "@turf/turf";
import { UnitType } from "./weapons";
declare const turf: typeof _turf;
declare const moment: any;

export type Vector2 = [number, number]; // Note! Longitude, Latitude (x, y)
export interface Waypoint {
	location: Vector2,
	temporary?: boolean
}

export interface Entity {
    readonly id: string;
	location: Vector2;
	
	tick(secondsElapsed: number): Promise<void>; // Do something every time iteration
}

export const NAVIGATION_THRESHOLD = 10; // 10 meters

export class Utilities {
	static randomFloat(max: number = 1): number {
		return Math.random() * max;
	}
	static randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	static degreesToRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}
	static radiansToDegrees(radians: number): number {
		return radians * (180 / Math.PI);
	}
	static pointToVector(point: _turf.Feature<_turf.Point, _turf.Properties>): Vector2 {
		return turf.getCoord(point) as Vector2;
	}
	static isEnemy(me: Team, them: Team): boolean {
		if (me === Team.Georgia && them === Team.Russia) {
			return true;
		}
		if (me === Team.Russia && them === Team.Georgia) {
			return true;
		}
		if (me === Team.Georgia && them === Team.SouthOssetia) {
			return true;
		}
		if (me === Team.SouthOssetia && them === Team.Georgia) {
			return true;
		}
		return false;
	}
}

// >"Team"
export enum Team {
	Russia, Georgia, SouthOssetia, None
}

export interface HoverInfo {
	name: string;
	team: string;
	color: string;
	health: number;
}

export class Dispatcher {
	private tickCount: number = 0;
	private readonly secondsPerTick: number = 60 * 1; // 1 minute elapses per tick

	private time: Date;
	get formattedTime(): string {
		return moment(this.time).utc().format("DD MMM YY HHmm[Z]");
	}

	public entities: Entity[];

	constructor(start: Date, entities: Entity[]) {
		this.time = start;
		this.entities = entities;

		window.addEventListener("mousemove", e => {
			if (this.hoverInfo.length > 0) {
				this.hoverInfoBox.style.top = `${e.pageY + 15}px`;
				this.hoverInfoBox.style.left = `${e.pageX + 15}px`;
			}
		});
	}

	public addEntities(entities: Entity | Entity[]): void {
		this.entities = this.entities.concat(entities);
	}
	public removeEntity(entityID: string): Entity | null {
		let removeIndex = this.entities.findIndex(entity => entity.id === entityID);
		if (removeIndex === -1) {
			return null;
		}
		return this.entities.splice(removeIndex, 1)[0];
	}

	private hoverInfo: HoverInfo[] = [];
	private hoverInfoBox = document.getElementById("hover-info")!;
	private hoverInfoCompiled: string = "";
	private updateInfoCompiled(): void {
		this.hoverInfoCompiled = "";

		if (this.hoverInfo.length === 0) {
			this.hoverInfoBox.style.display = "none";
			return;
		}
		
		for (let [i, info] of this.hoverInfo.entries()) {
			this.hoverInfoCompiled += `
			<strong style="font-size: 80%;">${info.name}</strong>
			<br />
			Side: <span style="color: ${info.color}">${info.team}</span> | Health: ${info.health.toFixed(1)}
			`;
			if (i !== this.hoverInfo.length - 1) {
				this.hoverInfoCompiled += "<hr />"
			}
		}
		this.hoverInfoBox.innerHTML = this.hoverInfoCompiled;
		this.hoverInfoBox.style.display = "block";
	}
	public addInfo(info: HoverInfo): void {
		if (info.color.toLowerCase() === "#ffffff") {
			info.color = "#000000"; // Text will be unreadable otherwise
		}
		let existingIndex = this.hoverInfo.findIndex(existingInfo => existingInfo.name === info.name);
		if (existingIndex === -1) {
			this.hoverInfo.push(info);
			// Sort alphabetically
			this.hoverInfo = this.hoverInfo.sort((a, b) => {
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
				return 0;
			});
		}
		else {
			this.hoverInfo[existingIndex] = info;
		}
		this.updateInfoCompiled();
	}
	public removeInfo(name: string): boolean {
		let index = this.hoverInfo.findIndex(info => info.name === name);
		if (index === -1) {
			return false;
		}
		this.hoverInfo.splice(index, 1);
		this.updateInfoCompiled();
		return true;
	}

	public async tick(): Promise<void> {
		this.time.setSeconds(this.time.getSeconds() + this.secondsPerTick);

		for (let entity of this.entities) {
			await entity.tick(this.secondsPerTick);
		}
	}
}
