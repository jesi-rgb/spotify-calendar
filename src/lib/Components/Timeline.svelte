<script>
	import { scaleTime } from 'd3-scale';

	import { axisLeft } from 'd3-axis';
	import { select, selectAll } from 'd3-selection';
	import { zoom } from 'd3-zoom';
	import { dateFromHour, eventsFromTracks } from '../utils';

	export let timeResolution = 10;
	export let my = 20;
	export let mx = 60;

	let pinYAxis;
	let pinGLines;
	let pinGRects;

	let svg_height = 1000;
	let svg_width = 600;

	$: height = svg_height - my * 2;
	$: width = svg_width - mx * 3;

	$: y = scaleTime()
		.domain([new Date().setHours(10), new Date().setHours(19)])
		.range([0, height - my])
		.nice();

	$: yAxis = axisLeft(y).ticks(timeResolution);

	$: lineCoords = y.ticks(timeResolution).map((t) => {
		let x1 = mx,
			x2 = width - mx;
		let y1 = y(t),
			y2 = y(t);
		return { x1: x1, y1: y1, x2: x2, y2: y2 };
	});

	let events = [
		{ start: dateFromHour('17:00'), end: dateFromHour('17:03'), title: 'balls' },
		{ start: dateFromHour('17:03'), end: dateFromHour('17:06'), title: 'damn' },
		{ start: dateFromHour('12:00'), end: dateFromHour('12:23'), title: 'bruh' }
	];

	const zoomBehaviour = zoom().scaleExtent([0.2, 60]).filter(filter).on('zoom', zoomed);

	function filter(event) {
		return (!event.ctrlKey || event.type === 'wheel') && !event.button;
	}
	function zoomed({ transform }) {
		// update axis
		let transformedY = transform.rescaleY(y);

		lineCoords = transformedY.ticks(10).map((t) => {
			let x1 = mx,
				x2 = width - mx;
			let y1 = transformedY(t),
				y2 = transformedY(t);
			return { x1: x1, y1: y1, x2: x2, y2: y2 };
		});

		select(pinYAxis).call(yAxis.scale(transformedY));
		// update lines
		selectAll('.lines')
			.attr('x1', (d) => 0)
			.attr('y1', (d) => transformedY(d))
			.attr('x2', (d) => width - mx)
			.attr('y2', (d) => transformedY(d));

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
			.attr('width', (d) => width - mx)
			.attr('height', (d) => {
				let startCoord = transformedY(d.start);
				let endCoord = transformedY(d.end);
				return endCoord - startCoord;
			});

		selectAll('.event-title')
			.data(events)
			.attr('x', (d) => mx)
			.attr('y', (d) => transformedY(d.start));
	}

	$: if (pinYAxis) {
		select(pinYAxis).call(yAxis).call(zoomBehaviour.on('zoom', zoomed));
	}
</script>

<svg width={svg_width} height={svg_height} class="m-4">
	<g class="yAxis font-mona text-lg" transform="translate({mx},{my})" bind:this={pinYAxis} />
	<g class="lines" bind:this={pinGLines}>
		{#each lineCoords as coord}
			<line
				x1={coord.x1}
				x2={coord.x2}
				y1={coord.y1 + my}
				y2={coord.y2 + my}
				stroke="blue"
				stroke-dasharray="10 10"
				opacity=".3"
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

	<g class="events" bind:this={pinGRects}>
		{#each events as event, i}
			<rect
				class="event"
				x={mx}
				y={y(event.start)}
				width={width - mx}
				height={y(event.end) - y(event.start)}
				fill="steelblue"
			/>
			<text
				id={'label-' + i}
				dominant-baseline="hanging"
				class="event-title"
				x={mx}
				y={y(event.start)}
				dx="6"
				fill="lightgreen"
				dy="4"
				mask={'url(#clip-rect-' + i}
				>{event.title}
			</text>
		{/each}
	</g>
</svg>

<!-- clip-path={'url(#clip-rect-' + i + ')'} -->
