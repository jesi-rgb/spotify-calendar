<script>
	import { scaleTime } from 'd3-scale';
	import {
		interpolate,
		interpolateZoom,
		zoomIdentity,
		zoomTransform,
		transition,
		easeLinear,
		least
	} from 'd3';

	import { axisLeft } from 'd3-axis';
	import { select, selectAll } from 'd3-selection';
	import { zoom, ZoomTransform } from 'd3-zoom';
	import { dateFromHour, eventsFromTracks } from '../utils';
	import { tracks } from '../../items';
	import { onMount } from 'svelte';

	export let timeResolution = 10;
	export let my = 20;
	export let mx = 80;
	export let events = eventsFromTracks(tracks);

	let pinComponent;
	let pinYAxis;

	let svg_height = 1000;
	let svg_width = 600;

	$: height = svg_height - my * 2;
	$: width = svg_width - mx;

	$: y = scaleTime()
		.domain([new Date().setHours(10), new Date().setHours(19)])
		.range([0, height - my])
		.nice();

	$: yAxis = axisLeft(y).ticks(timeResolution);

	$: lineCoords = y.ticks(timeResolution).map((t) => {
		let x1 = mx,
			x2 = width;
		let y1 = y(t) + my,
			y2 = y(t) + my;
		return { x1: x1, y1: y1, x2: x2, y2: y2 };
	});

	const zoomBehaviour = zoom()
		.interpolate(interpolateZoom.rho(0.1))
		.scaleExtent([0.02, 80])
		.filter(filter)
		.on('zoom', zoomed);

	let now = new Date();
	let currentZoom = zoomTransform(select(pinComponent));
	$: nowCoords = currentZoom.rescaleY(y)(now);

	function filter(event) {
		return (!event.ctrlKey || event.type === 'wheel') && !event.button;
	}

	function zoomed({ transform }) {
		// update axis
		let transformedY = transform.rescaleY(y);

		currentZoom = transform;

		lineCoords = transformedY.ticks(10).map((t) => {
			let x1 = mx,
				x2 = width;
			let y1 = transformedY(t) + my,
				y2 = transformedY(t) + my;
			return { x1: x1, y1: y1, x2: x2, y2: y2 };
		});

		select(pinYAxis).call(yAxis.scale(transformedY));

		selectAll('.event')
			.data(events)
			.attr('x', (d) => mx)
			.attr('y', (d) => transformedY(d.start))
			.attr('width', (d) => width - mx)
			.attr('height', (d) => {
				let startCoord = transformedY(d.start);
				let endCoord = transformedY(d.end);
				return endCoord - startCoord;
			});

		selectAll('.clip-rect')
			.data(events)
			.attr('x', (d) => mx)
			.attr('y', (d) => transformedY(d.start))
			.attr('width', (d) => width)
			.attr('height', (d) => {
				let startCoord = transformedY(d.start);
				let endCoord = transformedY(d.end);
				return endCoord - startCoord;
			});

		selectAll('.label-title')
			.data(events)
			.attr('x', (d) => mx)
			.attr('y', (d) => transformedY(d.start));

		selectAll('.label-artists')
			.data(events)
			.attr('x', (d) => mx)
			.attr('y', (d) => transformedY(d.start));

		selectAll('.label-secondary')
			.data(events)
			.attr('x', (d) => mx)
			.attr('y', (d) => transformedY(d.start));
	}

	$: if (pinComponent) {
		select(pinComponent).call(zoomBehaviour.on('zoom', zoomed));
	}
	$: if (pinYAxis) {
		select(pinYAxis).call(yAxis);
	}

	function reset() {
		select(pinComponent).transition().duration(1000).call(zoomBehaviour.transform, zoomIdentity);
	}

	onMount(() => {
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<button on:click={() => reset()} class="bg-gray-300 rounded-sm px-2 py-1 ring ring-black m-4"
	>Reset</button
>

<svg width={svg_width} height={svg_height} bind:this={pinComponent} class="m-4">
	<g class="yAxis font-mona text-lg" transform="translate({mx},{my})" bind:this={pinYAxis} />
	<g>
		{#each lineCoords as coord}
			<line
				class="dashed-lines"
				x1={coord.x1}
				x2={coord.x2}
				y1={coord.y1}
				y2={coord.y2}
				stroke="steelblue"
				stroke-dasharray="10 10"
				stroke-width="1.5"
				opacity=".5"
			/>
		{/each}
	</g>

	<defs>
		{#each events as event, i}
			<mask id={'clip-rect-' + i}>
				<rect
					id={'clip-rect-' + i}
					class="clip-rect"
					x={mx}
					y={y(event.start)}
					width={width - 2 * mx}
					height={y(event.end) - y(event.start)}
					fill="white"
				/>
			</mask>
		{/each}
	</defs>

	<g class="events">
		{#each events as event, i}
			<g class="group hover:cursor-pointer">
				<rect
					class="event hover:fill-lime-300"
					x={mx}
					y={y(event.start)}
					width={width - mx}
					height={y(event.end) - y(event.start)}
					fill="steelblue"
					stroke="darkblue"
				/>
				<text
					id={'label-' + i}
					dominant-baseline="hanging"
					class="label-title font-semibold text-xl pointer-events-none group-hover:fill-lime-800"
					x={mx}
					y={y(event.start)}
					dx="10"
					fill="white"
					dy="10"
					mask={'url(#clip-rect-' + i}
					>{event.title}
				</text>
				<text
					id={'label-artist-' + i}
					dominant-baseline="hanging"
					class="label-artists text-xl italic pointer-events-none group-hover:fill-lime-800"
					x={mx}
					y={y(event.start)}
					dx="10"
					fill="white"
					dy="35"
					mask={'url(#clip-rect-' + i}
					>{event.artists}
				</text>
				<text
					id={'label-secondary-' + i}
					dominant-baseline="hanging"
					class="label-secondary text-lg pointer-events-none group-hover:fill-lime-700"
					x={mx}
					y={y(event.start)}
					dx="10"
					fill="white"
					dy="70"
					opacity=".7"
					mask={'url(#clip-rect-' + i}
					>{new Date(event.duration).getMinutes()} minutes, {new Date(event.duration).getSeconds()} seconds
				</text>
			</g>
		{/each}

		<circle cx={mx} cy={nowCoords} r="3" fill="red" />
		<line x1={mx} y1={nowCoords} x2={width} y2={nowCoords} stroke-dasharray="10 10" stroke="red" />
	</g>
</svg>

<style>
	:root {
		--shadow-color: rgba(71, 138, 255, 0.48);
	}
	.event {
		-webkit-filter: drop-shadow(3px 3px 2px var(--shadow-color));
		filter: drop-shadow(3px 3px 0px var(--shadow-color));
		/* Similar syntax to box-shadow */
	}
	.label-title {
		font-variation-settings: 'wdth' 125;
	}
	.label-artists {
		font-variation-settings: 'wdth' 75;
	}
	.yAxis {
		font-variation-settings: 'wdth' 75;
	}
</style>
