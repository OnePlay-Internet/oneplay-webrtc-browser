"use client";

import React, { useEffect, useRef, useState } from "react";
import video_desktop from "../public/assets/videos/video_gameplay.mp4";
import styled from "styled-components";

import { TurnOnConfirm } from "../components/popup/popup";
import { Metrics, RemoteDesktopClient } from "../core/app";
import { useSearchParams } from "next/navigation";
import { AddNotifier, ConnectionEvent, Log, LogLevel } from "../core/utils/log";
import { WebRTCControl } from "../components/control/control";
import { getPlatform, Platform } from "../core/utils/platform";
import { Modal } from "@mui/material";
import { IconHorizontalPhone } from "../public/assets/svg/svg_cpn";
import config from "../config.json";
import Metric from "../components/metric/metric";
import { AudioMetrics, NetworkMetrics, VideoMetrics } from "../core/qos/models";
import { VideoWrapper } from "../core/pipeline/sink/video/wrapper";
import { AudioWrapper } from "../core/pipeline/sink/audio/wrapper";
import { SignalingConfig } from "../core/signaling/config";
import GamepadManager from "../core/hid/gamepad";

let client: RemoteDesktopClient = null;
let video: VideoWrapper = null;
let audio: AudioWrapper = null;

type ConnectStatus =
    | "not started"
    | "started"
    | "connecting"
    | "connected"
    | "closed";
export default function Home() {
    const [videoConnectivity, setVideoConnectivity] =
        useState<ConnectStatus>("not started");
    const [audioConnectivity, setAudioConnectivity] =
        useState<ConnectStatus>("not started");
    const [metrics, setMetrics] = useState<
        {
            index: number;
            receivefps: number;
            decodefps: number;
            packetloss: number;
            bandwidth: number;
            buffer: number;
        }[]
    >([]);
    useEffect(() => {
        window.onbeforeunload = (e: BeforeUnloadEvent) => {
            const text = "Are you sure (??????)";
            client.hid.ResetKeyStuck();
            e = e || window.event;
            if (e) e.returnValue = text;
            return text;
        };
    }, []);
    const remoteVideo = useRef<HTMLVideoElement>(null);
    const remoteAudio = useRef<HTMLAudioElement>(null);

    let ref_local = "";
    if (typeof window !== "undefined") {
        ref_local = localStorage.getItem("reference");
    }

    const searchParams = useSearchParams();
    const platform = searchParams.get("platform");
    const brString = searchParams.get("bitrate");
    const turn = searchParams.get("turn") == "true";
    const session_id = searchParams.get("session_id")

    const [bitrate, setBitrate] = useState(
        (Number(brString) || 10000) > 10000 ? 10000 : Number(brString)
    );
    const no_mic = searchParams.get("mutemic") == "true";

    const [Platform, setPlatform] = useState<Platform>(null);

    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [initialialHeight, setInitialialHeight] = useState(0);

    const redirectToLogin = () => {
        location.href =
            config.app_domain +
            "/login?redirectUrl=" +
            encodeURIComponent(location.href);
    };

    const SetupConnection = async () => {
        const SignalingConfig: SignalingConfig = {
            audioURL: config.signalling_url,
            dataURL: "",
            videoURL: config.signalling_url,
        };
        const WebRTCConfig: RTCConfiguration = { iceServers: [] };
        client = new RemoteDesktopClient(
            SignalingConfig,
            { ...WebRTCConfig, iceTransportPolicy: turn ? "relay" : "all" },
            video,
            audio,
            Platform,
            false,
            true,
            session_id
        );

        client.ChangeBitrate(bitrate);
        client.ChangeFramerate(55);

        client.HandleMetrics = async (metrics: Metrics) => {
            switch (metrics.type) {
                case "VIDEO":
                    setMetrics(
                        metrics.decodefps.map((val, index) => {
                            return {
                                index: index,
                                receivefps: metrics.receivefps[index],
                                decodefps: metrics.decodefps[index],
                                packetloss: metrics.packetloss[index],
                                bandwidth: metrics.bandwidth[index],
                                buffer: metrics.buffer[index],
                            };
                        })
                    );
                case "FRAME_LOSS":
                    console.log("frame loss occur");
                    break;
                default:
                    break;
            }
        };
        client.HandleMetricRaw = async (
            data: NetworkMetrics | VideoMetrics | AudioMetrics
        ) => {};
    };

    useEffect(() => {
        AddNotifier(
            async (
                message: ConnectionEvent,
                text?: string,
                source?: string
            ) => {
                if (message == ConnectionEvent.WebRTCConnectionClosed)
                    (await source) == "audio"
                        ? setAudioConnectivity("closed")
                        : setVideoConnectivity("closed");
                if (message == ConnectionEvent.WebRTCConnectionDoneChecking)
                    (await source) == "audio"
                        ? setAudioConnectivity("connected")
                        : setVideoConnectivity("connected");
                if (message == ConnectionEvent.WebRTCConnectionChecking)
                    (await source) == "audio"
                        ? setAudioConnectivity("connecting")
                        : setVideoConnectivity("connecting");

                if (message == ConnectionEvent.ApplicationStarted) {
                    await TurnOnConfirm(message, text);
                    setAudioConnectivity("started");
                    setVideoConnectivity("started");
                }

                Log(LogLevel.Infor, `${message} ${text ?? ""} ${source ?? ""}`);
            }
        );

        setPlatform((old) => {
            if (platform == null) return getPlatform();
            else return platform as Platform;
        });

        video = new VideoWrapper(remoteVideo.current);
        audio = new AudioWrapper(remoteAudio.current);
        SetupConnection().catch((error) => {
            //    TurnOnAlert(error);
        });
    }, []);

    const [isModalOpen, setModalOpen] = useState(false);
    const checkHorizontal = (width: number, height: number) => {
        if (Platform == "mobile") setModalOpen(false);
    };

    useEffect(() => {
        checkHorizontal(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", (e: UIEvent) => {
            checkHorizontal(window.innerWidth, window.innerHeight);
        });

        return () => {
            window.removeEventListener("resize", (e: UIEvent) => {
                checkHorizontal(window.innerWidth, window.innerHeight);
            });
        };
    }, [Platform]);

    const toggleMouseTouchCallback = async function (enable: boolean) {
        client?.hid?.DisableTouch(!enable);
        client?.hid?.DisableMouse(!enable);
    };
    const bitrateCallback = async function (bitrate: number) {
        client?.ChangeBitrate(bitrate);
        client?.ChangeFramerate(55);
        setBitrate(bitrate);
    };
    const GamepadACallback = async function (
        x: number,
        y: number,
        type: "left" | "right"
    ): Promise<void> {
        client?.hid?.VirtualGamepadAxis(x, y, type);
    };
    const GamepadBCallback = async function (
        index: number,
        type: "up" | "down"
    ): Promise<void> {
        client?.hid?.VirtualGamepadButtonSlider(type == "down", index);
    };
    const MouseMoveCallback = async function (
        x: number,
        y: number
    ): Promise<void> {
        client?.hid?.mouseMoveRel({ movementX: x, movementY: y });
    };
    const MouseButtonCallback = async function (
        index: number,
        type: "up" | "down"
    ): Promise<void> {
        type == "down"
            ? client?.hid?.MouseButtonDown({ button: index })
            : client?.hid?.MouseButtonUp({ button: index });
    };
    const keystuckCallback = async function (): Promise<void> {
        client?.hid?.ResetKeyStuck();
    };
    const clipboardSetCallback = async function (val: string): Promise<void> {
        client?.hid?.SetClipboard(val);
        client?.hid?.PasteClipboard();
    };
    const audioCallback = async () => {
        client?.ResetAudio();
        await video.play();
        await audio.play();
    };

    const _gamepadButton = (gp_num: number, btn_num: number, val: number) => {
        if (btn_num == 6 || btn_num == 7) {
            const toks = "js|b|" + gp_num + "|" + btn_num + "|" + val * 255;
            console.log(toks);

            // dc.send(toks)
        } else {
            const toks = "js|b|" + gp_num + "|" + btn_num + "|" + val;
            // if(btn_num===3 && val===1) RequestKeyFrame();
            // if(btn_num===15 && val===1) RestartVideo();
            console.log(toks);
            // dc.send(toks)
        }
    };
    const _gamepadAxis = (gp_num: number, axis_num: number, val: number) => {};
    /**
     * Sends command to WebRTC app to connect virtual joystick and initializes the local GamepadManager.
     * @param {GamepadEvent} event
     */
    const _gamepadConnected = function (event: GamepadEvent): void {
        let gamepadManager = new GamepadManager(
            event.gamepad,
            _gamepadButton,
            _gamepadAxis
        );
    };

    //window.addEventListener("gamepadconnected", _gamepadConnected);
    return (
        <Body>
            <RemoteVideo
                ref={remoteVideo}
                src={platform == "desktop" ? video_desktop : video_desktop}
                autoPlay
                playsInline
            ></RemoteVideo>
            <WebRTCControl
                platform={Platform}
                toggle_mouse_touch_callback={toggleMouseTouchCallback}
                bitrate_callback={bitrateCallback}
                GamepadACallback={GamepadACallback}
                GamepadBCallback={GamepadBCallback}
                MouseMoveCallback={MouseMoveCallback}
                MouseButtonCallback={MouseButtonCallback}
                keystuckCallback={keystuckCallback}
                audioCallback={audioCallback}
                clipboardSetCallback={clipboardSetCallback}
            ></WebRTCControl>
            {/* <audio
                ref={remoteAudio}
                autoPlay={true}
                playsInline={true}
                controls={false}
                muted={false}
                loop={true}
                style={{ zIndex: -5, opacity: 0 }}
            ></audio> */}
            {/* <Modal open={isModalOpen}>
                <ContentModal>
                    <IconHorizontalPhone />
                    <TextModal>
                        Please rotate the phone horizontally!!
                    </TextModal>
                </ContentModal>
            </Modal> */}
            {/* <Metric
                videoConnect={videoConnectivity}
                audioConnect={audioConnectivity}
                decodeFPS={metrics.map((x) => {
                    return { key: x.index, value: x.decodefps };
                })}
                receiveFPS={metrics.map((x) => {
                    return { key: x.index, value: x.receivefps };
                })}
                packetLoss={metrics.map((x) => {
                    return { key: x.index, value: x.packetloss };
                })}
                bandwidth={metrics.map((x) => {
                    return { key: x.index, value: x.bandwidth };
                })}
                buffer={metrics.map((x) => {
                    return { key: x.index, value: x.buffer };
                })}
                bitrate={bitrate}
                platform={Platform}
            /> */}
        </Body>
    );
}

const RemoteVideo = styled.video`
    position: absolute;
    z-index: 1;
    -webkit-transform-style: preserve-3d;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    margin: 0;
    width: 100%;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
    opacity: 1;
    overflow: hidden;
`;
const Body = styled.div`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    border: 0;
    background-color: black;
`;
const App = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
`;
const ContentModal = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`;
const TextModal = styled.p`
    font-weight: 500;
    color: white;
`;
//export default Home;?
