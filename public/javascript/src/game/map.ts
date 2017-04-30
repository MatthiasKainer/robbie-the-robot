import { ActionType, MapGoal, Position, Stars } from "../models";

export interface GoalResult {
    stars: Stars;
}

export interface Goals {
    maxStars: Stars;
    results: MapGoal[];
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
}