"use client"

import React from 'react';
import styled,  { keyframes }  from 'styled-components'
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSearchParams } from 'next/navigation';
import { Platform } from '../../core/utils/platform';

export interface Data{
	key: number,
	value: number
}

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

const options = {
	responsive: true,
	plugins: {
		legend: {
			position: 'top' as const,
		},
	},
};


const MobileMetric = (props: {
		receiveFPS: Data[]
		decodeFPS: Data[]
		packetLoss: Data[]
		bandwidth: Data[]
		buffer: Data[]
	}) => {
	const getAvgData = (data: Data[]) => Math.round(data.map(e => e.value).reduce((a,b) => a+b, 0) / data.length) || 0;

	return (
		<React.Fragment>
			<Text>FPS: {getAvgData(props.decodeFPS)}/{getAvgData(props.receiveFPS)}</Text>
			<Text>Packetloss: {getAvgData(props.packetLoss)}</Text>
			<Text>Bandwidth: {getAvgData(props.bandwidth)}</Text>
			<Text>Buffer: {getAvgData(props.buffer)}</Text>
		</React.Fragment>
	);
}


const DesktopMetric = (props: {
		receiveFPS: Data[]
		decodeFPS: Data[]
		packetLoss: Data[]
		bandwidth: Data[]
		buffer: Data[]
	}) => {
	const data = [{
		labels: props.receiveFPS.map(item => item.key),
		datasets: [{
				label: 'receive fps',
				data: props.receiveFPS.map((item)=>item.value),
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},{
				label: 'decode fps',
				data: props.decodeFPS.map((item)=>item.value),
				borderColor: '#fff',
				backgroundColor: "#fff",
		}],
	}, {
		labels: props.packetLoss.map(item => item.key),
		datasets: [{
			label: 'packetloss',
			data: props.packetLoss.map((item)=>item.value),
			borderColor: 'rgb(255, 99, 132)',
			backgroundColor: 'rgba(255, 99, 132, 0.5)',
		}],
	}, {
		labels: props.bandwidth.map(item => item.key),
		datasets: [{
			label: 'bandwidth',
			data: props.bandwidth.map((item)=>item.value),
			borderColor: 'rgb(255, 99, 132)',
			backgroundColor: 'rgba(255, 99, 132, 0.5)',
		}],
	}, {
		labels: props.buffer.map(item => item.key),
		datasets: [{
			label: 'buffered frame',
			data: props.buffer.map((item)=>item.value),
			borderColor: 'rgb(255, 99, 132)',
			backgroundColor: 'rgba(255, 99, 132, 0.5)',
		}],
	}]

	return (
		<React.Fragment>
			{ data.map((val,key) => { return <Line key={key} options={options} data={val} /> }) }
		</React.Fragment>
	);
}


const Metric = (props: {
		receiveFPS: Data[]
		decodeFPS: Data[]
		packetLoss: Data[]
		bandwidth: Data[]
		buffer: Data[]
		videoConnect: 'loading' | 'connect' | 'disconnect' | string
		audioConnect: 'loading' | 'connect' | 'disconnect' | string
		platform: Platform
		bitrate: number
	}) => {
	const searchParams = useSearchParams();
	const [isOpen, setOpen] = React.useState(searchParams.get('show_stats') === 'true')

	const handleOpen = () => {
		setOpen(!isOpen)
	}

	return (
		<Container 
			style={{minHeight: props.platform === 'mobile' ? 189 : 502}} 
			className={isOpen ? 'slide-in' : 'slide-out'}
		>
			<Button onClick={handleOpen}>
				{
					isOpen 
					? <IoIosArrowForward style={{fontSize:34}} color="white"/> 
					: <IoIosArrowBack 	 style={{fontSize:34}} color="white"/>
				}
			</Button>
			{
				isOpen &&
				<WrapperContent >
					<Text>Status Video: {props.videoConnect}</Text>
					<Text>Status audio: {props.audioConnect}</Text>
					<Text>Bitrate: {props.bitrate / 1000} mbps</Text>
					{
						props.platform === 'desktop'
							? <DesktopMetric
								bandwidth={props.bandwidth}
								buffer={props.buffer}
								decodeFPS={props.decodeFPS}
								packetLoss={props.packetLoss}
								receiveFPS={props.receiveFPS}
							/> : <MobileMetric
								bandwidth={props.bandwidth}
								buffer={props.buffer}
								decodeFPS={props.decodeFPS}
								packetLoss={props.packetLoss}
								receiveFPS={props.receiveFPS}
							/>
					}
				</WrapperContent>
			}

		</Container>
	);
}


const slideInAnimation = keyframes`
  from {
    transform: translateX(95%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOutAnimation = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(95%);
  }
`
const Container = styled.div`
	display: flex;
	position: fixed;
	top: 0px;
	right: 0;
	z-index: 1;
	width: 200px;
	animation-duration: 0.5s;
	animation-timing-function: ease-in-out;
	animation-fill-mode: both;
	/*transform: translateX(5%);		*/

	&.slide-in {
    	animation-name: ${slideInAnimation};
		
	}

	&.slide-out {
		animation-name: ${slideOutAnimation};
	}	
`

const WrapperContent = styled.div`
    width: 100%;
    height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 15px;	
	margin-left: 16px;
	padding: 16px 0;
	padding-left: 16px;
	background: rgb(242 232 232 / 16%);

`
const Text = styled.span`
	color: white;
`
const Button = styled.button`
	position: absolute;
	top: 0;
    left: -12px;
    bottom: 0;
	outline: none;
	border: none;
	background: none;
`
interface Props {
	videoConnect?: 'loading' | 'connect' | 'disconnect' | string
	audioConnect?: 'loading' | 'connect' | 'disconnect' | string
	fps?: string
}
export default Metric