<script>
	import { scaleTime } from 'd3-scale';
	import { interpolateZoom, zoomIdentity, zoomTransform } from 'd3';

	import { axisLeft } from 'd3-axis';
	import { select, selectAll } from 'd3-selection';
	import { zoom } from 'd3-zoom';
	import { eventsFromTracks } from '../utils';
	import { tracks } from '../../items';
	import { onMount } from 'svelte';

	//  external variables
	export let timeResolution = 10;
	export let my = 20;
	export let mx = 80;
	export let events = eventsFromTracks(tracks);

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

	//  define lots of things
	let svgRef;
	let yAxisRef;
	let eventsRef;

	let svg_height = 1000;
	let svg_width = 600;

	const zoomBehaviour = zoom()
		.interpolate(interpolateZoom.rho(0.5))
		.scaleExtent([0.02, 80])
		.filter(filter)
		.on('zoom', zoomed);

	let now = new Date();
	let currentZoom = zoomTransform(select(svgRef));

	// define reactive things

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
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<svg width={svg_width} height={svg_height} bind:this={svgRef} class="m-4">
	<g class="yAxis font-mona text-lg" transform="translate({mx},{my})" bind:this={yAxisRef} />
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
					y={y(event.start)}
					width={width - 2 * mx}
					height={y(event.end) - y(event.start)}
					fill="white"
				/>
			</mask>
		{/each}
	</defs>

	<g bind:this={eventsRef} class="events">
		{#each events as event, i}
			<g class="group hover:cursor-pointer">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<rect
					on:click={() => focusOnEvent(i)}
					id={'event-' + i}
					class="event hover:fill-lime-300 fill-purple-500 stroke-2 stroke-purple-900"
					x={mx}
					y={y(event.start)}
					width={width - mx}
					height={y(event.end) - y(event.start)}
				/>
				<text
					id={'label-' + i}
					dominant-baseline="hanging"
					class="label-title font-widest font-bold text-2xl pointer-events-none group-hover:fill-lime-800"
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
					class="label-artists font-narrowest text-xl pointer-events-none group-hover:fill-lime-800"
					x={mx}
					y={y(event.start)}
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

		<circle cx={mx} cy={nowCoords} r="3" class="fill-purple-800" />
		<line
			x1={mx}
			y1={nowCoords}
			x2={width}
			y2={nowCoords}
			stroke-dasharray="5 10"
			class="stroke-purple-800"
		/>
		<text x={width} y={nowCoords} text-anchor="end" class="text-xs fill-purple-800" dy="-2"
			>{now.toLocaleTimeString()}</text
		>
	</g>
</svg>

<button
	on:click={() => focusOnEvent(0)}
	class="bg-gray-300 rounded-sm px-2 py-1 ring ring-black m-4">Oldest song</button
>
<button on:click={() => reset()} class="bg-gray-300 rounded-sm px-2 py-1 ring ring-black m-4"
	>Now</button
>

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
