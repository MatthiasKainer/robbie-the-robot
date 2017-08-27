import { ActionType, MapGoal, Position, Stars } from "../models";

export interface GoalResult {
    stars: Stars;
}

export interface Goals {
    maxStars: Stars;
    results: MapGoal[];
}

interface Page {
    duration: number;
    audio?: string;
    target: string;
}

export interface Tutorial {
    pages: Page[];
}

export abstract class Map {
    public key: string;
    public name: string;
    public description: string;
    public rows: number;
    public columns: number;
    public robot: Position;
    public goal: Position;
    public goals: Goals;
    public fields: any[];
    public actions: ActionType[];
    public tutorial?: Tutorial;
}