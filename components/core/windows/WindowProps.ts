import { FC } from "react";
import { vec2 } from "../utils/vec2";
import { observable } from "mobx";

export class WindowProps {
    @observable accessor size: vec2;
    @observable accessor position: vec2;
    @observable accessor WindowContent: FC;
    @observable accessor fullscreen: boolean;
    @observable accessor minimized: boolean;

    constructor(args: {
        size: vec2;
        position: vec2;
        WindowContent: FC;
        fullscreen: boolean;
        minimized: boolean;
    }) {
        this.size = args.size;
        this.position = args.position;
        this.WindowContent = args.WindowContent;
        this.fullscreen = args.fullscreen;
        this.minimized = args.minimized;
    }
}