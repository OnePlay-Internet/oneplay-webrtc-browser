"use client";

import { useSearchParams } from "next/navigation";

export const Header = () => {
    const searchParams = useSearchParams();

    const title = "Playing " + (searchParams.get("title") || "Game");

    return (
        <head>
            <title>{title}</title>
            <meta name="apple-mobile-web-app-capable" content="yes"></meta>
            <meta name="apple-touch-fullscreen" content="yes" />
            <meta
                name="apple-mobile-web-app-status-bar-style"
                content="black-translucent"
            />
            <meta name="apple-mobile-web-app-title" content="OnePlay" />
            <meta
                name="viewport"
                content= "user-scalable=no"
            />
            <meta httpEquiv="Cache-control" content="no-cache"></meta>
            <link rel="icon" href="/webplay/favicon.ico" />
            <link rel="manifest" href="/webplay/manifest.json" />
        </head>
    );
};
