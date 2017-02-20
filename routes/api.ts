import * as express from 'express';
import {router as levels} from './src/levels';
import {router as features} from './src/features';
import {router as editing} from './src/editing';
import {router as images} from './src/images';
export let router = express.Router();

router.use('/features', features);
router.use('/levels', levels);
router.use('/editing', editing);
router.use('/images', images);