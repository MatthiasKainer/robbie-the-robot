import { ApiGateway, Routes } from "../net/api";
export interface FeatureToggle {
    name: string;
    state: boolean;
}

export class FeatureToggleService {
    public api: ApiGateway = new ApiGateway();

    public all(): Promise<FeatureToggle[]> {
        return ApiGateway.get(new Routes.FeatureToggles());
    }

    public get(name: string): Promise<FeatureToggle> {
        return ApiGateway.get(new Routes.FeatureToggle(name));
    }
}