<script>
	import { scaleTime } from 'd3-scale';
	import { interpolate, interpolateZoom, zoomIdentity, transition, easeLinear } from 'd3';

	import { axisLeft } from 'd3-axis';
	import { select, selectAll } from 'd3-selection';
	import { zoom } from 'd3-zoom';
	import { dateFromHour, eventsFromTracks } from '../utils';
	import { tracks } from '../../items';

	export let timeResolution = 10;
	export let my = 20;
	export let mx = 80;

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

	let events = [
		{ start: dateFromHour('17:00'), end: dateFromHour('17:03'), title: 'balls' },
		{ start: dateFromHour('17:03'), end: dateFromHour('17:06'), title: 'damn' },
		{ start: dateFromHour('12:00'), end: dateFromHour('12:23'), title: 'amar a rosanita' }
	];
	events = eventsFromTracks(tracks);
	console.log(events);

	const zoomBehaviour = zoom().scaleExtent([0.02, 60]).filter(filter).on('zoom', zoomed);

	function filter(event) {
		return (!event.ctrlKey || event.type === 'wheel') && !event.button;
	}
	function zoomed({ transform }) {
		// update axis
		let transformedY = transform.rescaleY(y);

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
		selectAll('.event-shadow')
			.data(events)
			.attr('x', (d) => mx + 4)
			.attr('y', (d) => transformedY(d.start) + 4)
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

		selectAll('.event-title')
			.data(events)
			.attr('x', (d) => mx)
			.attr('y', (d) => transformedY(d.start));

		selectAll('.event-secondary')
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
</script>

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
					width={width - mx}
					height={y(event.end) - y(event.start)}
					fill="white"
				/>
			</mask>
		{/each}
	</defs>

	<g class="events">
		{#each events as event, i}
			<rect
				class="event-shadow"
				x={mx + 4}
				y={y(event.start) + 4}
				width={width - mx}
				height={y(event.end) - y(event.start)}
				fill="lightblue"
				opacity=".6"
			/>
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
					class="event-title font-semibold text-xl pointer-events-none group-hover:fill-lime-800"
					x={mx}
					y={y(event.start)}
					dx="10"
					fill="white"
					dy="10"
					mask={'url(#clip-rect-' + i}
					>{event.title} · {event.artists}
				</text>
				<text
					id={'label-secondary-' + i}
					dominant-baseline="hanging"
					class="event-secondary text-lg pointer-events-none group-hover:fill-lime-700"
					x={mx}
					y={y(event.start)}
					dx="10"
					fill="white"
					dy="35"
					opacity=".7"
					mask={'url(#clip-rect-' + i}
					>{new Date(event.duration).getMinutes()} minutes, {new Date(event.duration).getSeconds()} seconds
				</text>
			</g>
		{/each}
	</g>
</svg>

<style>
	.event-title {
		font-variation-settings: 'wdth' 125;
	}
	.yAxis {
		font-variation-settings: 'wdth' 75;
	}
</style>
