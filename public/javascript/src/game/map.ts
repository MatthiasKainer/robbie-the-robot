import { ActionType, MapGoal, Position, Stars } from '../models';

export interface GoalResult {
    stars : Stars,
}

export interface Goals {
    maxStars : Stars,
    results : MapGoal[]
}

export abstract class Map {
    key : string;
    name : string;
    description : string;
    rows : number;
    columns : number;
    robot : Position;
    goal : Position;
    goals : Goals;
    fields : any[];
    actions: ActionType[];
}