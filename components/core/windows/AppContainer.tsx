'use client'

import { FC, useCallback, useEffect, useState } from "react";
import { Rnd, RndDragCallback, RndResizeCallback } from "react-rnd";
import { observer } from "mobx-react-lite";
import { WindowProps } from "./WindowProps";

const AppContainer: FC<{ window: WindowProps }> = observer(({ window }) => {


    const onDragStop: RndDragCallback = useCallback(
        (
            _event,
            { x, y }
        ) => {
            window.position = { x, y };
        },
        [window]
    );

    const onResizeStop: RndResizeCallback = useCallback(
        (
            _event,
            _direction,
            { style: { height, width } },
            _delta,
            { x, y }
        ) => {
            window.position = { x, y };
            window.size = {
                x: parseFloat(width),
                y: parseFloat(height)
            };
        },
        [window]
    );

    return (
        <Rnd
            size={{ width: window.size.x, height: window.size.y }}
            position={window.position}
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            className="border-2 border-solid rounded-lg"
        >
            <window.WindowContent />
        </Rnd>
    );
});

export default AppContainer;
