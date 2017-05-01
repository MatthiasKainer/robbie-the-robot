import { app } from "../../app";
import { defineSupportCode } from "cucumber";

defineSupportCode(function ({ Before, After }) {
    Before(function () {
        console.log("Booting up server...");
        this.server = app.listen(3000);
    });

    After(function () {
        console.log("Shutting down server...");
        this.server.close();
    });
});

defineSupportCode(function ({ setDefaultTimeout }) {
    setDefaultTimeout(60 * 1000);
});