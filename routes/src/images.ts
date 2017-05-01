import * as express from "express";
import * as fs from "fs";
import * as path from "path";
export let router = express.Router();

router.get("/", (req, res, next) => {
    res.type("application/json");
    new ImageFilesReader().all()
        .then((images) => {
            res.send({
                images,
            });
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
});

const extensions = {
    image: [".png", ".jpg"],
};

const is = {
    image: (element: string) => {
        return extensions.image.indexOf(path.extname(element)) >= 0;
    },
};

export class ImageFilesReader {
    public static images: string = __dirname + "/../../public/images";

    public all(): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readdir(ImageFilesReader.images, (err, files) => {
                if (err) { return reject(err); }

                return resolve(files
                    .filter(is.image));
            });
        });
    }
}