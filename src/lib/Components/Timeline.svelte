<script>
	import { scaleTime } from 'd3-scale';
	import { interpolateZoom, zoomIdentity, zoomTransform } from 'd3';

	import { axisLeft } from 'd3-axis';
	import { select } from 'd3-selection';
	import { zoom } from 'd3-zoom';
	import { onMount } from 'svelte';
	import { trackAndFetchIncomingDates } from '../fetcher';
	import { seenDays } from '../../stores';
	import { get } from 'svelte/store';
	// import { nextBatchOfTracks } from '../utils';

	//  external variables
	export let timeResolution = 10;
	export let my = 20;
	export let mx = 85;
	export let events = [];

	//  functions
	function filter(event) {
		return (!event.ctrlKey || event.type === 'wheel') && !event.button;
	}

	function reset() {
		select(svgRef).transition().duration(1000).call(zoomBehaviour.transform, zoomIdentity);
	}

	function focusOnEvent(i) {
		const coord = y(events[i].start);

		reset();
		select(svgRef)
			.transition()
			.duration(800)
			.call(
				zoomBehaviour.transform,
				zoomIdentity
					.translate(width / 2, height / 2)
					.scale(20)
					.translate(-mx, -coord)
			);
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

		select(yAxisRef).call(yAxis.scale(transformedY));
	}

	//  define lots of things
	let svgRef;
	let yAxisRef;

	let svg_height = 900;
	let svg_width = 600;

	const zoomBehaviour = zoom()
		.interpolate(interpolateZoom.rho(0.5))
		.scaleExtent([0.02, 80])
		.filter(filter)
		.on('zoom', zoomed);

	let now = new Date();
	let currentZoom = zoomTransform(select(svgRef));
	$: console.log('changed: ' + $seenDays);

	// define reactive things
	$: currentYScale = currentZoom.rescaleY(y);

	// TODO: we need to somehow overwrite the events array. struggling hard to do this
	// $: trackAndFetchIncomingDates(events, currentYScale.ticks()).then((v) => {
	// 	events = [...v, events];
	// });

	$: height = svg_height - my * 2;
	$: width = svg_width - mx;

	$: y = scaleTime()
		.domain([new Date().setHours(new Date().getHours() - 3), new Date()])
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

	$: nowCoords = currentZoom.rescaleY(y)(now);

	$: if (svgRef) {
		select(svgRef).call(zoomBehaviour.on('zoom', zoomed));
	}
	$: if (yAxisRef) {
		select(yAxisRef).call(yAxis);
	}

	onMount(() => {
		// this interval controls the clock
		const seconds = setInterval(() => {
			now = new Date();
		}, 1000);

		// const bruh = setInterval(() => {
		// 	// events = nextBatchOfTracks(events);
		// }, 1900);

		return () => {
			// clearInterval(bruh);
			clearInterval(seconds);
		};
	});
</script>

<div class="max-w-xs mx-0 md:max-w-2xl md:mx-auto  justify-center">
	<svg
		width={svg_width}
		height={svg_height}
		viewBox="{mx / 2} {my} {width} {height - my}"
		bind:this={svgRef}
		class="m-4"
	>
		<g
			class="yAxis font-mona font-narrower text-lg"
			transform="translate({mx},{my})"
			bind:this={yAxisRef}
		/>
		<g>
			{#each lineCoords as coord}
				<line
					class="dashed-lines"
					x1={coord.x1}
					x2={coord.x2}
					y1={coord.y1}
					y2={coord.y2}
					stroke="steelblue"
					stroke-dasharray="5 10"
					stroke-width="1.5"
					opacity=".2"
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
						y={currentYScale(event.start)}
						width={width - mx}
						height={currentYScale(event.end) - currentYScale(event.start)}
						fill="white"
					/>
				</mask>
			{/each}
		</defs>

		<g class="events">
			{#each events as event, i}
				<g class="group hover:cursor-pointer">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<rect
						on:click={() => focusOnEvent(i)}
						id={'event-' + i}
						class="event transition-colors hover:fill-lime-300 hover:stroke-lime-900 fill-purple-500 stroke-2 stroke-purple-900"
						x={mx}
						y={currentYScale(event.start)}
						width={width - mx}
						height={currentYScale(event.end) - currentYScale(event.start)}
					/>

					<text
						id={'label-' + i}
						dominant-baseline="hanging"
						class="label-title font-widest font-bold text-2xl pointer-events-none group-hover:fill-lime-800"
						x={mx}
						y={currentYScale(event.start)}
						dx="10"
						fill="white"
						dy="10"
						mask={'url(#clip-rect-' + i}
						>{event.title}
					</text>
					<text
						id={'label-artist-' + i}
						dominant-baseline="hanging"
						class="label-artists font-narrowest text-xl pointer-events-none group-hover:fill-lime-800"
						x={mx}
						y={currentYScale(event.start)}
						dx="10"
						fill="white"
						dy="40"
						mask={'url(#clip-rect-' + i}
						>{event.artists}
					</text>
					<text
						id={'label-secondary-' + i}
						dominant-baseline="hanging"
						class="label-secondary font-light font-narrower text-lg pointer-events-none group-hover:fill-lime-700"
						x={mx}
						y={currentYScale(event.start)}
						dx="10"
						fill="white"
						dy="70"
						opacity=".7"
						mask={'url(#clip-rect-' + i}
						>{new Date(event.duration).getMinutes()} minutes, {new Date(
							event.duration
						).getSeconds()} seconds
					</text>
				</g>
			{/each}

			<circle cx={mx} cy={nowCoords} r="3" class="fill-purple-800" />
			<line
				x1={mx}
				y1={nowCoords}
				x2={width}
				y2={nowCoords}
				stroke-dasharray="5 10"
				class="stroke-purple-800"
			/>
			<text
				x={width}
				y={nowCoords}
				text-anchor="end"
				class="text-xs font-widest fill-purple-800"
				dy="-2">{now.toLocaleTimeString()}</text
			>
		</g>
	</svg>

	<div class="flex absolute right-0 text-lime-900">
		<button
			on:click={() => focusOnEvent(0)}
			class="bg-lime-300 rounded-sm px-2 py-1 ring ring-lime-800 m-4">Oldest song</button
		>
		<button on:click={() => reset()} class="bg-lime-300 rounded-sm px-2 py-1 ring ring-lime-800 m-4"
			>Now</button
		>
	</div>
</div>

<style>
	:root {
		--shadow-color: #310b56;
		--selected-shadow-color: #354c0c;
	}
	.event {
		-webkit-filter: drop-shadow(3px 3px 0px var(--shadow-color));
		filter: drop-shadow(3px 3px 0px var(--shadow-color));
		/* Similar syntax to box-shadow */
	}
	.event:hover {
		-webkit-filter: drop-shadow(3px 3px 0px var(--selected-shadow-color));
		filter: drop-shadow(3px 3px 0px var(--selected-shadow-color));
	}
</style>
