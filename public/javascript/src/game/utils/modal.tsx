declare var $ : any;
import * as React from 'react';

interface ModalProps {
    header: string;
    className?: any;
    hideFooter? : boolean;
}

interface OverlayProperties {
    className?: any;
}

export class Overlay extends React.Component<OverlayProperties, any> {
    public render() {
        return <Modal hideFooter={ true } className={"overlay modal-fullscreen " + this.props.className} header="">
            {this.props.children}
        </Modal>;
    }
}

export class Modal extends React.Component<ModalProps, any> {
    public render() {
        let footer = this.props.hideFooter ? "" :
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>;
        return <div className={"modal " + this.props.className}>
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{this.props.header}</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        {this.props.children}
                    </div>
                    {footer}
                </div>
            </div>
        </div>;
    }
}