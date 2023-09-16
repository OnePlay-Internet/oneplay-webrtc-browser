"use client"

import React, { useState, useEffect, useLayoutEffect, useContext, useTransition } from "react"; // we need this to make JSX compile
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import styled from "styled-components";
import {
    IJoystickUpdateEvent,
    Joystick,
} from "react-joystick-component/build/lib/Joystick";
import { ButtonMode, ConTrolContext } from "../control/control";
import { MouseButtonGroup } from "./mouse/mouse";





const defaultMouseGroupValue = { x: 25, y: 140 }
const defaultJoyStickValue   = { x: 160, y: 25 }

export const JoyStick = (param: {
    draggable: ButtonMode;
    moveCallback: (x: number, y: number) => Promise<void>;
}) => {
    const [enableJT, setenableJT] = useState<boolean>(false);
    const [position, setPosition] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    // set interval to send position per 100ms

    const move = (event: IJoystickUpdateEvent) => {
        if (event.type == "move") {
            if (!enableJT) {
                // param.moveCallback(0, 0);
                setPosition({ x: 0, y: 0 });
                return;
            }
            // param.moveCallback(event.`x, -event.y);
            setPosition({ x: event.x, y: -event.y });
        } else if (event.type == "stop") {
            setenableJT(false);
            setPosition({ x: 0, y: 0 });
        } else if (event.type == "start") {
            setenableJT(true);
        }
    };
    useEffect(() => {
        const set = () => { param.moveCallback(position.x * 6, position.y * 6) }

        set();
        const intervalSendPos = setInterval(set, 5);
        return () => { clearInterval(intervalSendPos); };
    }, [position]);
    return (
        <Joystick
            start={move}
            stop={move}
            move={move}
            baseColor="#000"
            stickColor="hwb(360 51% 76%)"
            disabled={param.draggable === 'draggable'}

        />
    );
};


const MouseGroup = (param: {
    draggable: Partial<ButtonMode>;
    AxisCallback: (x: number, y: number) => Promise<void>;
    ButtonCallback: (index: number, type: "up" | "down") => Promise<void>;
    KeyboardCallback: (code: string, type: "up" | "down") => Promise<void>;
}) => {

    const [posBtn, setPosBtn] = useState(defaultMouseGroupValue);
    const [isPending, startTransition] = useTransition()
    const { isSetVMouseDefaultValue } = useContext(ConTrolContext);

    useLayoutEffect(() => {
        const cache = localStorage.getItem(`mouse_group_pos`);
        if (cache === null) {
            setPosBtn(defaultMouseGroupValue)
            return;
        }

        const { x, y } = JSON.parse(cache);

        if (x == null || x == null)
            setPosBtn(defaultMouseGroupValue)
        else 
            setPosBtn({ x: x, y: y });
    }, []);

    const handleDrag = (e: DraggableEvent, data: DraggableData) => {
        startTransition(()=>{
            setPosBtn({
                x: data.x,
                y: data.y,
            });
        })
    };

    const handleStop = (e: DraggableEvent, data: DraggableData) => {
        startTransition(()=>{
            localStorage.setItem(`mouse_group_pos`, JSON.stringify(posBtn));
        })
    };


    //reset default value
    useEffect(() => {
        if (isSetVMouseDefaultValue === true) {
            setPosBtn(defaultMouseGroupValue)
            localStorage.setItem(`mouse_group_pos`, JSON.stringify(defaultMouseGroupValue));
        }
    }, [isSetVMouseDefaultValue])
    return (
        <Draggable
            disabled={param.draggable != "draggable"}
            position={{ x: posBtn.x, y: posBtn.y }}
            onStop={handleStop}
            onDrag={handleDrag}
        >
            <WrapperDrag>
                <MouseButtonGroup
                    size={90}
                    onTouch={(type, index) => param.ButtonCallback(index, type)}
                    onEnter={type          => param.KeyboardCallback("Enter", type)}
                ></MouseButtonGroup>
            </WrapperDrag>
        </Draggable>
    );
};



const JoyStickBtn = (param: {
    draggable: Partial<ButtonMode>;
    AxisCallback: (x: number, y: number) => Promise<void>;
    ButtonCallback: (index: number, type: "up" | "down") => Promise<void>;
}) => {
    const [posBtn, setPosBtn] = useState(defaultJoyStickValue);
    const { isSetVMouseDefaultValue } = useContext(ConTrolContext);
    const [isPending, startTransition] = useTransition()

    useLayoutEffect(() => {
        let cache = localStorage.getItem(`joystick_btn_pos`);

        if (cache === null) {
            setPosBtn(defaultJoyStickValue)
            return;
        }
        const { x, y } = JSON.parse(cache);
        //if(x === null || x ===null){
        //    setPosBtn(defaultJoyStickValue)
        //    return
        //}
        setPosBtn({ x: x, y: y });
    }, []);

    const handleDrag = (e: DraggableEvent, data: DraggableData) => {
        const { x, y } = posBtn;
        startTransition(()=>{
            setPosBtn({
                x: data.x,
                y: data.y,
            });
        })
    };

    const handleStop = (e: DraggableEvent, data: DraggableData) => {
        startTransition(()=>{
            localStorage.setItem(`joystick_btn_pos`, JSON.stringify(posBtn));
        })
    };

    
     //reset default value
     useEffect(() => {
        if (isSetVMouseDefaultValue === true) {
            setPosBtn(defaultJoyStickValue)
            localStorage.setItem(`joystick_btn_pos`, JSON.stringify(defaultJoyStickValue));
        }
    }, [isSetVMouseDefaultValue])
    return (
        <Draggable
            disabled={param.draggable != "draggable"}
            position={{ x: posBtn.x, y: posBtn.y }}
            onStop={handleStop}
            onDrag={handleDrag}
        >
            <WrapperDrag>
                <JoyStick
                    moveCallback={param.AxisCallback}
                    draggable={param.draggable}
                ></JoyStick>
            </WrapperDrag>
        </Draggable>
    );
};
export const VirtualMouse = (param: {
    draggable: ButtonMode;
    MouseMoveCallback: (move_x: number, move_y: number) => Promise<void>;
    MouseButtonCallback: (index: number, type: "up" | "down") => Promise<void>;
    KeyboardCallback: (code: string, type: "up" | "down") => Promise<void>;
}) => {


    return (
        <>
            {param.draggable == "static" || param.draggable == "draggable" ? (
                <ContainerVirtMouse>
                    <MouseGroup
                        AxisCallback={param.MouseMoveCallback}
                        ButtonCallback={param.MouseButtonCallback}
                        KeyboardCallback={param.KeyboardCallback}
                        draggable={param.draggable}
                    />
                    <JoyStickBtn
                        AxisCallback={param.MouseMoveCallback}
                        ButtonCallback={param.MouseButtonCallback}
                        draggable={param.draggable}
                    />
                </ContainerVirtMouse>
            ) : null}
        </>
    );
};

const ContainerVirtMouse = styled.div`
    display: flex;
    align-items: center;
    z-index: 2;
    position: relative;
`;
const WrapperDrag = styled.div`
    max-width: max-content;
    opacity: 0.3;
`;
