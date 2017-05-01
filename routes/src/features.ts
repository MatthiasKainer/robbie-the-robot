import { FeatureToggle } from "../../public/javascript/src/toggles/features";
import * as express from "express";
export let router = express.Router();

const featureToggles: FeatureToggle[] = [
    {
        name: "code-editor",
        state: false,
    },
];

router.get("/", (req, res, next) => {
    res.type("application/json");
    res.send(featureToggles);
});

router.get("/:feature", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const feature = req.params.feature;
    const featureCookie = `ft_${feature}`;
    if (req.cookies[featureCookie]) {
        return req.cookies[featureCookie];
    }

    return featureToggles.find(_ => _.name === feature);
});