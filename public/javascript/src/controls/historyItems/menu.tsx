import * as React from "react";

interface MenuItem {
    onClick: (e: Event) => void;
}

export class MenuItemLink extends React.Component<MenuItem, any> {

    public render(): JSX.Element {
        return <a className="dropdown-item" href="#" onClick={(e) => this.props.onClick(e as any as Event)}>
            {this.props.children }
        </a>;
    }
}

export class MenuItemDivider extends React.Component<MenuItem, any>  {
    public render(): JSX.Element {
        return <div className="dropdown-divider"></div>;
    }
}

interface MenuItemProps {
}

export class Menu extends React.Component<MenuItemProps, any>  {
    public render() {
        return <ul className="nav">
            <li className="nav-item dropdown">
                <a className="dropdown-toggle" data-selector="open-menu" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"></a>
                <div className="dropdown-menu dropdown-menu-right">
                    {this.props.children}
                </div>
            </li>
        </ul>;
    }
}