import { Way } from '../public/javascript/src/models';
import { editingMode, recurringVisitor } from './utils/cookies';
import * as express from 'express';
export let router = express.Router();

/* GET home page. */
router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.cookies[recurringVisitor]) {
        res.cookie(recurringVisitor, true);
        return res.redirect("/tutorial");
    }

    res.render('index', {
        title: 'robbiebot'
    });
});

router.get('/toggleEditingMode', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let mode = (() => {
        switch (req.cookies[editingMode] || Way.Click) {
            case Way.Click:
                return Way.Code;
            case Way.Code:
                return Way.Click;
        }
    })();

    res.cookie(editingMode, mode);
    res.redirect(`/`);
});

router.get('/levels', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.render('levels', {
        title: 'robbiebot'
    });
});

router.get('/levels/:level', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.render('index', {
        title: 'robbiebot'
    });
});

router.get('/parents', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.render('parents', {
        title: 'parental guide'
    });
});
router.get('/offline', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.render('offline', {
        title: 'Free "Robbie the Robot" Board Game'
    });
});

router.get('/tutorial', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.render('tutorial', {
        title: 'robbiebot'
    });
});
