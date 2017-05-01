import { ApiGateway, Routes } from "./net/api";
import * as React from "react";

const images = [
    "/images",
];

interface ImageLoaderState {
    images: string[];
}

export class ImageLoader extends React.Component<any, ImageLoaderState> {
    public constructor() {
        super();
        this.state = { images: [] };
    }

    public componentWillMount() {
        ApiGateway.get(new Routes.Images()).then(_ => {
            this.setState({ images: _.images });
        });
    }

    public render() {
        const images: any[] = [];
        this.state.images.forEach(_ => {
            images.push(<img key={_} src={`/images/${_}`} />);
        });

        return <div style={{ position: "absolute", top: "0", left: "0", width: "1", height: "1", overflow: "hidden" }}>
            {images}
        </div>;
    }
}