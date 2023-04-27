import * as React from "react";
import StyledComponentsRegistry from "../lib/registry";
import "../styles/globals.css";
import GoogleAnalytics from "./googleAnalytics";
import { Header } from "../components/header/header";

async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <Header />
            <body>
                <GoogleAnalytics trackPageViews></GoogleAnalytics>
                <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
            </body>
        </html>
    );
}

export default RootLayout;
