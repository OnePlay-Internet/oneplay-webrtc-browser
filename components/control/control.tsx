"use client"

import { Fullscreen, Key, VolumeUp } from "@mui/icons-material";
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined';
import VideoSettingsOutlinedIcon from '@mui/icons-material/VideoSettingsOutlined';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { List, SpeedDial, SpeedDialAction } from "@mui/material";
import ListIcon from '@mui/icons-material/List';
import React, { useEffect, useState, useLayoutEffect, createContext } from "react"; // we need this to make JSX compile
import { Platform } from "../../core/src/utils/platform";
import { requestFullscreen } from "../../core/src/utils/screen";
import { AskSelectBitrate, TurnOnClipboard } from "../popup/popup";
import { VirtualGamepad } from "../virtGamepad/virtGamepad";
import { VirtualMouse } from "../virtMouse/virtMouse";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import MobileControl from "./mobileControl";
import Setting from "../setting";
import SettingsIcon from '@mui/icons-material/Settings';

export type ButtonMode = "static" | "draggable" | "disable";

interface IControlContext {
	isSetVGamePadDefaultValue:boolean
	isSetVMouseDefaultValue:boolean
}
export const ConTrolContext = createContext<IControlContext | null>(null)

const sxSpeedDial = {
	opacity: 0.3,
	position: 'absolute',
	bottom: '2%',
	right: '2%',
	'& .MuiFab-primary': { backgroundColor: 'white', color: 'white' }
}
export const WebRTCControl = (input: {
	GamepadACallback: (x: number, y: number, type: 'left' | 'right') => Promise<void>,
	GamepadBCallback: (index: number, type: 'up' | 'down') => Promise<void>,
	MouseMoveCallback: (x: number, y: number) => Promise<void>,
	MouseButtonCallback: (index: number, type: 'up' | 'down') => Promise<void>,
	keystuckCallback: () => Promise<void>,
	audioCallback: () => Promise<void>,
	clipboardSetCallback: (val: string) => Promise<void>,

	bitrate_callback: (bitrate: number) => Promise<void>,
	toggle_mouse_touch_callback: (enable: boolean) => Promise<void>,
	platform: Platform
}) => {
	const [enableVGamepad, setenableVGamepad] = useState<ButtonMode>("disable");
	const [enableVMouse, setenableVMouse] = useState<ButtonMode>("disable");
	const [actions, setactions] = useState<any[]>([]);
	const [isModalSettingOpen, setModalSettingOpen] = useState(false)

	useEffect(() => {
		input.toggle_mouse_touch_callback((enableVGamepad == 'disable') && (enableVMouse == 'disable'));
	}, [enableVGamepad, enableVMouse])

	const handleDraggable = (type: 'VGamePad' | 'VMouse', value: boolean) => {

		setModalSettingOpen(false)
		if (type === 'VGamePad') {
			setenableVGamepad("draggable")
			setenableVMouse("disable")

		} else if (type === 'VMouse') {
			setenableVMouse("draggable")
			setenableVGamepad("disable")
		}

	}


	const [defaultPos, setDefaultPos] = useState()
	const [tempPos, setTempPos] = useState()
	const [isSetVGamePadDefaultValue, setVGamePadDefaultValue] = useState(false)
	const [isSetVMouseDefaultValue, setVMouseDefaultValue] = useState(false)

	const handleOkeyDragValue = () => {
		if (enableVGamepad === 'draggable') {
			setenableVGamepad('static')
		}
		else if (enableVMouse === 'draggable') {
			setenableVMouse('static')
		}
	}

	const handleSetDeafaultDragValue = () => {
		if(enableVGamepad ==='draggable'){
			setVGamePadDefaultValue(true)
		}else if(enableVMouse ==='draggable'){
			setVMouseDefaultValue(true)
		}
	}
	//reset per/click default
	useEffect(()=>{
		setVGamePadDefaultValue(false)
		setVMouseDefaultValue(false)
	}, [isSetVGamePadDefaultValue])

	useEffect(() => {
		console.log(`configuring menu on ${input.platform}`)
		if (input.platform == 'mobile') {
			setactions([{
				icon: <VideoSettingsOutlinedIcon />,
				name: "Bitrate",
				action: async () => {
					let bitrate = await AskSelectBitrate();
					if (bitrate < 500) {
						return;
					}
					console.log(`bitrate is change to ${bitrate}`);
					await input.bitrate_callback(bitrate); // don't touch async await here, you'll regret that
				},
			},
			{
				icon: <SportsEsportsOutlinedIcon />,
				name: "Edit VGamepad",
				action: async () => {

					setenableVMouse('disable')
					setenableVGamepad((prev) => {
						switch (prev) {
							case "disable":
								return "static";
							case "static":
								return "disable";
						}
					});
				},
			}, {
				icon: <MouseOutlinedIcon />,
				name: "Enable VMouse",
				action: () => {
					setenableVGamepad('disable')
					setenableVMouse((prev) => {
						switch (prev) {
							case "disable":
								return "static";
							case "static":
								return "disable";
						}
					});

				},
			}, {
				icon: <VolumeUp />,
				name: "If your audio is muted",
				action: () => { input.audioCallback() },
			}, {
				icon: <KeyboardIcon />,
				name: "Write to clipboard",
				action: async () => {
					const text = await TurnOnClipboard()
					await input.clipboardSetCallback(text)
				},
			}, {
				icon: <SettingsIcon />,
				name: "Setting",
				action: () => {
					setModalSettingOpen(true)
				},
			}])
		} else {
			setactions([{
				icon: <VideoSettingsOutlinedIcon />,
				name: "Bitrate",
				action: async () => {
					try {
						let bitrate = await AskSelectBitrate();
						if (bitrate < 500) {
							return;
						}
						console.log(`bitrate is change to ${bitrate}`);
						await input.bitrate_callback(bitrate);
					} catch { }
				},
			}, {
				icon: <Fullscreen />,
				name: "Enter fullscreen",
				action: () => { requestFullscreen() }
			}, {
				icon: <VolumeUp />,
				name: "If your audio is muted",
				action: () => { input.audioCallback() },
			}, {
				icon: <KeyboardIcon />,
				name: "If some of your key is stuck",
				action: () => { input.keystuckCallback() },
			}])
		}
	}, [input.platform])


	const contextValue:IControlContext = {
		isSetVGamePadDefaultValue,
		isSetVMouseDefaultValue
	}
	return (
		<ConTrolContext.Provider value={contextValue}>
			<div
				className="containerDrag"
				style={{ maxWidth: 'max-content', maxHeight: 'max-content' }}
			>
				{
					input.platform === 'mobile' ?

						<MobileControl
							actions={actions}
							isShowBtn={enableVGamepad === 'draggable' || enableVMouse === 'draggable'}
							onOkey={handleOkeyDragValue}
							onDefault={handleSetDeafaultDragValue}
						/> :

						<SpeedDial
							ariaLabel="SpeedDial basic example"
							sx={sxSpeedDial}
							icon={<ListIcon sx={{ color: 'black' }} />}
						>
							{actions.map((action) => (
								<SpeedDialAction
									key={action.name}
									icon={action.icon}
									tooltipTitle={action.name}
									onClick={action.action}
								/>
							))}
						</SpeedDial>
				}
			</div>

			<VirtualMouse
				MouseMoveCallback={input.MouseMoveCallback}
				MouseButtonCallback={input.MouseButtonCallback}
				draggable={enableVMouse} />

			<VirtualGamepad
				ButtonCallback={input.GamepadBCallback}
				AxisCallback={input.GamepadACallback}
				draggable={enableVGamepad}
				SelectCallback={() => { }}
				StartCallback={() => { }}
			/>

			<Setting
				onDraggable={handleDraggable}
				isOpen={isModalSettingOpen}
				closeModal={() => { setModalSettingOpen(false) }}
			/>
		</ConTrolContext.Provider >
	);
};