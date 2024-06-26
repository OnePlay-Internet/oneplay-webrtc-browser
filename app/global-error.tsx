'use client'

import { useEffect } from "react"
import styled from "styled-components";

export default function GlobalError({
	reset,
}: {
	reset: () => void
}) {
	return (
		<html>
			<Body>
				<h2>ERROR</h2>
				<h2>To run our product seamlessly, please ensure your device is updated to the latest OS <strong>(iOS 16/15 or Android 14/13).</strong></h2>
				<button onClick={() => reset()}>Try again</button>
			</Body>
		</html>
	)
}

const Body = styled.body`
	display: flex;
	flex-direction: column;
	gap: 14px;
	align-items: center;
	justify-content: center;

	width: 100vw;
	height: 100vh;


`