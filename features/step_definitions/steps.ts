import { defineSupportCode } from 'cucumber';

import chai = require('chai');
const expect = chai.expect;

defineSupportCode(function ({ Given, When, Then }) {

    Given('I open the level {level}', function (level, callback: any) {
        this.visit(`/levels/${level}`, () => {
            expect(this.isPresent("robot")).to.be.true;
            expect(this.isPresent(`direction up`)).to.be.true;
            callback();
        });
    });
    
    When('I choose action {action}', function (action) {
        this.clickOn(`action ${action}`);
    });

    When('I move {direction}', function (direction) {
        this.clickOn(`direction ${direction}`);
    });

    When('I run my program', function () {
        this.clickOn(`run program`);
        let gameState = this.waitUntil("game state");
        return gameState.is("RUNNING").then(() => {
            return gameState.waitFor(10 * 1000)
                .not("RUNNING");
        });
    });

    Then('I should see the {notification} notification', function (notification: string) {
        expect(this.isPresent(`${notification} notification`)).to.be.true;
    });
});