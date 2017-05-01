import { Way } from "../../public/javascript/src/models";
import { editingMode } from "../utils/cookies";
import * as express from "express";
export let router = express.Router();

router.get("/mode", (req, res, next) => {
    res.type("application/json");
    res.send({
        way : req.cookies[editingMode] || Way.Click,
    });
});