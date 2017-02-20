import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
export let router = express.Router();

router.get('/', (req, res, next) => {
    res.type("application/json");
    new ImageFilesReader().all()
        .then((images) => {
            res.send({
                images : images
            });
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        })
});

let extensions = {
    image: ['.png', '.jpg']
};

let is = {
    image: (element: string) => {
        var extName = path.extname(element);
        return extensions.image.indexOf(extName) >= 0;
    }
};

export class ImageFilesReader {
    static images: string = __dirname + "/../../public/images";

    public all(): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readdir(ImageFilesReader.images, (err, files) => {
                if (err) return reject(err);

                return resolve(files
                    .filter(is.image));
            });
        });
    }
}