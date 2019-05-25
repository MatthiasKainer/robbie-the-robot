require('jsdom-global')();
import * as React from 'react';
import { expect } from 'chai';
import { mount, ReactWrapper } from 'enzyme';
import * as sinon from 'sinon';
import { suite, test } from "mocha-typescript";

import Element from "../../../../../public/javascript/src/tutorial/element";
import { Page, PageElement } from "../../../../../public/javascript/src/tutorial/page";

class Audio {
    play() {}
}

(global as any).Audio = Audio;

@suite("[Page] When having no elements")
class Empty {
    page: ReactWrapper<Page, any>;
    public before() {
        this.page = mount(<Page elements={[]} />);
    }

    @test public "it should hide the tutorial"() {
        expect(this.page.find(`[data-test="tutorial-page"]`).length).to.equal(0);
        expect(this.page.contains(<Element target="" />)).to.be.false;
    }
}


@suite("[Page] When having a single element")
class One {
    target = "some element";
    elements: PageElement[];
    clock: sinon.SinonFakeTimers;
    page: ReactWrapper<Page, any>;
    spies: sinon.SinonSpy[];

    public before() {
        this.elements = [{
            duration: 500,
            target: this.target,
            audio: "file"
        }];
        this.clock = sinon.useFakeTimers();
        this.spies = [
            sinon.spy(Page.prototype, 'playAudio')
        ];
        this.page = mount(<Page elements={this.elements} />);
        (this.page.instance() as any).startTutorial()
    }

    public after() {
        this.spies.forEach(_ => _.restore());
        this.clock.restore();
    }

    @test public "it should play the element and hide the tutorial"() {
        expect(this.page.contains(<Element target={this.target} />), "Element added").to.be.true;
        expect(this.page.find(`[data-test="tutorial-page"]`).length).to.equal(1);
        expect((Page.prototype.playAudio as sinon.SinonSpy).called, "Audio not started").to.equal(false);
        this.clock.tick(600);
        expect((Page.prototype.playAudio as sinon.SinonSpy).callCount, "Audio started").to.equal(1);
        this.clock.tick(2000);
        expect((Page.prototype.playAudio as sinon.SinonSpy).calledOnce, "Audio started").to.equal(true);
        expect(this.page.contains(<Element target={this.target} />), "Element removed").to.be.false;
        expect(this.page.find(`[data-test="tutorial-page"]`).length).to.equal(0);
    }
}


@suite("[Page] When having multiple elements")
class Multiple {
    target = "some element";
    elements: PageElement[];
    clock: sinon.SinonFakeTimers;
    page: ReactWrapper<Page, any>;
    spies: sinon.SinonSpy[];

    public before() {
        this.elements = [{
            duration: 500,
            target: this.target + "1",
            audio: "file"
        }, {
            duration: 500,
            target: this.target + "2",
            audio: "file"
        }];
        this.clock = sinon.useFakeTimers();
        this.spies = [
            sinon.spy(Page.prototype, 'playAudio')
        ];
        this.page = mount(<Page elements={this.elements} />);
        (this.page.instance() as any).startTutorial()
    }

    public after() {
        this.spies.forEach(_ => _.restore());
        this.clock.restore();
    }

    @test public "it should play all elements and hide the tutorial"() {
        expect(this.page.contains(<Element target={this.target + "1"} />), "First element expected").to.be.true;
        expect(this.page.find(`[data-test="tutorial-page"]`).length).to.equal(1);
        expect((Page.prototype.playAudio as sinon.SinonSpy).calledOnce, "Audio not yet started").to.equal(false);
        this.clock.tick(600);
        expect((Page.prototype.playAudio as sinon.SinonSpy).callCount, "First Audio started").to.equal(1);
        this.clock.tick(1000);
        expect(this.page.contains(<Element target={this.target + "2"} />), "Second element expected").to.be.true;
        expect(this.page.find(`[data-test="tutorial-page"]`).length).to.equal(1);
        this.clock.tick(2000);
        expect((Page.prototype.playAudio as sinon.SinonSpy).calledTwice, "Second audi started").to.equal(true);
        expect(this.page.contains(<Element target={this.target + "2"} />), "Second element gone").to.be.false;
        expect(this.page.find(`[data-test="tutorial-page"]`).length).to.equal(0);
    }
}