import * as fs from 'fs';
import * as async from 'async';
import * as path from 'path';
import { Map } from '../../public/javascript/src/game/map';
import * as express from 'express';
export let router = express.Router();


router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    new LevelFilesReader().all().then(data => {
        res.type("application/json");
        res.send(data);
    }).catch(err => {
        console.error(err);
        res.sendStatus(500);
    });
});

router.get('/:level', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    new LevelFilesReader().one(req.params.level)
        .then(data => {
            res.type("application/json");
            res.send(data);
        })
        .catch(err => {
            console.error(err);
            if (err.code === "ENOENT") res.sendStatus(404);
            else res.sendStatus(500);
        });
});

router.get('/:level/next', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let level = req.params.level;
    new LevelFilesReader().levelOrder()
        .then((data: GameOrder) => {
            res.type("application/json");

            for (var i = 0; i < data.levels.length - 1; i++) {
                let current = data.levels[i];
                console.log(`Comparing ${current} with ${level}...`);
                if (current === level) return res.send({ next : data.levels[i + 1] });
            }

            res.sendStatus(416);
        })
        .catch(err => {
            console.error(err);
            if (err.code === "ENOENT") res.sendStatus(404);
            else res.sendStatus(500);
        });
});

let extensions = {
    json: '.json'
};

let is = {
    json: (element: string) => {
        var extName = path.extname(element);
        return extName === extensions.json;
    }
};

let parseJson = (file: string, data: string) => {
    try {
        let result = JSON.parse(data);
        result.key = file.replace(extensions.json, "");
        return result;
    } catch (err) {
        return "";
    }
}

let readFile = (file: string, callback: (err: NodeJS.ErrnoException, data: any) => void) => {
    fs.readFile(LevelFilesReader.levelsDirectory + file, "utf-8", (err: NodeJS.ErrnoException, data: string) => {
        callback(err, err || !data ? null : parseJson(file, data));
    });
}

export type GameOrder = {
    levels: string[]
}

export class LevelFilesReader {
    static dataFolder: string = __dirname + "/../../data/";
    static levelsDirectory: string = LevelFilesReader.dataFolder + "levels/";

    private readFileDelegate(_: string) {
        return (callback: (err: NodeJS.ErrnoException, data: any) => void) => {
            readFile(_, callback);
        }
    }

    private sortLevels(levels: Map[]): Promise<any> {
        return this.levelOrder()
            .then((order) => {
                return new Promise((resolve, reject) => {
                    let result: Map[] = [];
                    order.levels.forEach(level => {
                        result.push(levels.find(_ => _.key === level));
                    });

                    resolve(result);
                });
            });
    }

    public levelOrder(): Promise<GameOrder> {
        return new Promise((resolve, reject) => {
            fs.readFile(LevelFilesReader.dataFolder + "gamesetup.json", "utf-8", (err, data) => {
                if (err) return reject(err);
                else return resolve(JSON.parse(data));
            });
        });
    }

    public one(level: string): Promise<any> {
        return new Promise((resolve, reject) => {
            readFile(level + extensions.json, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    public all(): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readdir(LevelFilesReader.levelsDirectory, (err, files) => {
                if (err) return reject(err);

                let fileReaders = files
                    .filter(is.json)
                    .map(this.readFileDelegate);

                async.parallel(fileReaders, (err, data) => {
                    if (err) return reject(err);
                    this.sortLevels(data as Map[]).then(resolve).catch(reject);
                });
            });
        });
    }
}