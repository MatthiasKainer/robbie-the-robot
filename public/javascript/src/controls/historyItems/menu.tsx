import * as React from "react";

interface MenuItem {
    content: JSX.Element;
    onClick: (e: Event) => void;
    render(): JSX.Element;
}

export class MenuItemLink implements MenuItem {
    public content: JSX.Element;
    public onClick: (e: Event) => void;

    public constructor(content: JSX.Element, onClick: (e: Event) => void) {
        this.content = content;
        this.onClick = onClick;
    }

    public render(): JSX.Element {
        return <a className="dropdown-item" href="#" onClick={(e) => this.onClick(e as any as Event)}>{this.content}</a>;
    }
}

export class MenuItemDivider implements MenuItem {
    public content: JSX.Element;
    public onClick: (e: Event) => void;

    public render(): JSX.Element {
        return <div className="dropdown-divider"></div>;
    }
}

interface MenuItemProps {
    items: MenuItem[];
}

export class Menu extends React.Component<MenuItemProps, any>  {
    public render() {
        return <ul className="nav">
            <li className="nav-item dropdown">
                <a className="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"></a>
                <div className="dropdown-menu dropdown-menu-right">
                    {this.props.items.map(_ => _.render())}
                </div>
            </li>
        </ul>;
    }
}