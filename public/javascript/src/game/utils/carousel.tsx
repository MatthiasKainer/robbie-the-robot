declare var $: any;
import * as React from 'react';
import * as crypto from 'crypto';

export class Carousel extends React.Component<any, any> {
    public componentDidMount() {
        $('.carousel').carousel({
            interval : "false"
        });
    }

    public render() {
        let indicators = [];
        let token = "carousel_" + crypto.randomBytes(5).toString('hex'); 

        for(let i=0;i<this.props.count;i++) {
            indicators.push(<li key={i} data-target={`#${token}`} 
                data-slide-to={i} 
                className={i === 0 ? "active" : ""}></li>);
        }

        return <div id={token} data-interval="false" className="carousel slide" style={{ boxShadow: "inset 0px 5px 14px 1px rgba(0,0,0,0.75)" }}>
            <ol className="carousel-indicators">
                {indicators}
            </ol>
            <div className="carousel-inner" role="listbox" style={ { padding: "40px 80px" } }>
                {this.props.children}
            </div>
            <a className="carousel-control-prev" href={`#${token}`} role="button" data-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="sr-only">Previous</span>
            </a>
            <a className="carousel-control-next" href={`#${token}`} role="button" data-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="sr-only">Next</span>
            </a>
        </div>
    }
}