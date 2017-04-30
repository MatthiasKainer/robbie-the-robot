declare const $: any;

interface Route {
    path: string;
    parent?: Route;
}

export namespace Routes {

    export class NextLevel implements Route {
        public path: string = "next/";
        public parent: Route;

        public constructor(level: string) {
            this.parent = new Level(level);
        }
    }

    export class Level implements Route {
        public path: string;
        public parent: Route = new Levels();

        public constructor(level: string) {
            this.path = `${level}/`;
        }
    }

    export class FeatureToggle implements Route {
        public path: string;
        public parent: Route = new Levels();

        public constructor(toggle: string) {
            this.path = `${toggle}/`;
        }
    }

    export class EditingMode implements Route {
        public path: string = "mode/";
        public parent: Route = new Editing();
    }

    export class Levels implements Route {
        public path: string = "levels/";
        public parent: Route = new Root();
    }

    export class FeatureToggles implements Route {
        public path: string = "toggles/";
        public parent: Route = new Root();
    }

    export class Editing implements Route {
        public path: string = "editing/";
        public parent: Route = new Root();
    }

    export class Images implements Route {
        public path: string = "images/";
        public parent: Route = new Root();
    }

    export class Root implements Route {
        public path: string = "/api/";
    }
}

class ApiRoutes {
    public static expand(route: Route, tail: string = ""): string {
        const path = route.path + tail;
        if (route.parent) {
            return this.expand(route.parent, path);
        }
        return path;
    }
}

export class ApiGateway {
    public static get(route: Route): Promise<any> {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: ApiRoutes.expand(route),
            }).done(resolve).fail(reject);
        });
    }

    public static post(route: Route, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: ApiRoutes.expand(route),
                body: JSON.stringify(data),
            }).done(resolve).fail(reject);
        });
    }

    public static delete(route: Route): Promise<any> {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: ApiRoutes.expand(route),
            }).done(resolve).fail(reject);
        });
    }

    public static put(route: Route, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "PUT",
                url: ApiRoutes.expand(route),
                body: JSON.stringify(data),
            }).done(resolve).fail(reject);
        });
    }
}