'use client'

import { ReactElement } from "react";
import Terminal from "../../apps/Terminal";
import AppContainer from "./AppContainer";
import { WindowProps } from "./WindowProps";


const WindowsView = (): ReactElement => {

    const windows = [
        new WindowProps({
            size :{
                x: 200,
                y: 500
            },
            position: {
                x: 20,
                y: 50
            },
            WindowContent: Terminal,
            fullscreen: false,
            minimized: false
        })
    ];

    return (
        <div>
            {windows.map((props: WindowProps, id: number) => {

                return <AppContainer
                    key={id}
                    window={props}
                />;
            })}
        </div>
    )
}

export default WindowsView;