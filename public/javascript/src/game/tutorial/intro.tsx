import { dirname } from 'path';
declare var $: any;
import * as React from 'react';
import { Overlay } from '../utils/modal';
import { Carousel } from '../utils/carousel';

interface SpeechBubble {
    element: JSX.Element;
}

let robotStyle = {
    width: "30%",
    backgroundPosition: "center center",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundImage: "/images/Tutorial/robbie_bubble-right.png"
}

let textStyle = (image : string) => {
    let textStyle = {
        width: "100%",
        height: "100%",
        backgroundPosition: "center center",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundImage: "/images/Tutorial/"
    }
    textStyle.backgroundImage = `url('/images/Tutorial/page${image}.png')`;
    return <div key={image} style={textStyle} alt={image} />;
}

class SpeechBubbleRight implements SpeechBubble {
    private style(): React.CSSProperties {
        return Object.assign({}, robotStyle, {backgroundImage : "url('/images/Tutorial/robbie_bubble-right.png')"});
    }

    element = <div style={this.style()} alt="Intro" />;
}

class SpeechBubbleLeft implements SpeechBubble {
    private style(): React.CSSProperties {
        return Object.assign({}, robotStyle, {backgroundImage : "url('/images/Tutorial/robbie_bubble-left.png')"});
    }

    element = <div style={this.style()} alt="Intro" />;
}

interface TutorialItem {
    isActive?: boolean;
    direction?: Direction;
    body: any[];
}

interface TutorialItemsProperty {
    items: TutorialItem[]
}

enum Direction {
    left,
    right,
    full
}

class TutorialItems extends React.Component<TutorialItemsProperty, any> {
    getRight(direction: Direction) {
        return (direction !== undefined && direction === Direction.right) ? new SpeechBubbleRight().element : "";
    }
    getLeft(direction: Direction) {
        return (direction !== undefined && direction === Direction.left) ? new SpeechBubbleLeft().element : "";
    }

    public render() {
        let items = this.props.items.map((item, index) => {
            return <div key={`carousel-item-${index}`} style={{ height: $('html').height() * 0.65 }} className={`carousel-item ${item.isActive ? "active" : ""}`}>
                {this.getRight(item.direction)}
                <div className={`tutorial-body ${Direction[item.direction]}`}>
                    {item.body}
                </div>
                {this.getLeft(item.direction)}
            </div>;
        })

        return <div>
            {items}
        </div>;
    }
}

export class Tutorial extends React.Component<any, any> {
    public openTutorial() {
        $('.tutorial').modal('show');
    }

    public render() {
        let items: TutorialItem[] = [
            {
                direction: Direction.right, isActive: true,
                body: [textStyle("01")]
            },
            {
                direction: Direction.full,
                body: [textStyle("02")]
            },
            {
                direction: Direction.left,
                body: [textStyle("03")]
            },
            {
                direction: Direction.right,
                body: [textStyle("04")]
            },
            {
                direction: Direction.full,
                body: [textStyle("05")]
            },
            {
                direction: Direction.full,
                body: [<video width="100%" controls>
                    <source src="/videos/tutorials/RobbieTutorial.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                    </video>]
            }
        ];

        return <Carousel count={items.length}>
            <TutorialItems items={items} />
        </Carousel>;
    }
}