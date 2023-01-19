<script>
	import { scaleTime } from 'd3-scale';
	import { timeMinute } from 'd3-time';

	import { axisLeft } from 'd3-axis';
	import { select, selectAll } from 'd3-selection';
	import { extent, line, max } from 'd3';
	import { zoom } from 'd3-zoom';
	import { dateFromHour, eventsFromTracks } from '../utils';

	export let timeResolution = 20;
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
		.range([0, height])
		.nice();

	$: yAxis = axisLeft(y).ticks(10);

	$: lineCoords = y.ticks(timeMinute.every(timeResolution)).map((t) => {
		let x1 = mx,
			x2 = width - mx;
		let y1 = y(t),
			y2 = y(t);
		return { x1: x1, y1: y1, x2: x2, y2: y2 };
	});

	let events = [{ start: dateFromHour('12:00'), end: dateFromHour('12:03'), title: 'Mierdón' }];

	const zoomBehaviour = zoom().scaleExtent([0.2, 30]).filter(filter).on('zoom', zoomed);

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
		selectAll('line')
			.join('line')
			.data(lineCoords)
			.attr('class', 'lines')
			.attr('x1', (d) => 0)
			.attr('y1', (d) => transformedY(d))
			.attr('x2', (d) => width - mx)
			.attr('y2', (d) => transformedY(d))
			.attr('stroke-dasharray', '10 10')
			.attr('opacity', '.3');

		selectAll('rect')
			.data(events)
			.join('rect')
			.attr('class', 'events')
			.attr('x', (d) => mx)
			.attr('y', (d) => transformedY(d.start))
			.attr('width', (d) => width - mx)
			.attr('height', (d) => {
				let startCoord = transformedY(d.start);
				let endCoord = transformedY(d.end);
				return endCoord - startCoord;
			})
			.attr('fill', 'steelblue')
			.attr('stroke-dasharray', '10 10')
			.attr('opacity', '.3');
	}

	$: if (pinYAxis) {
		select(pinYAxis).call(yAxis).call(zoomBehaviour.on('zoom', zoomed));
	}
	$: if (pinGLines) {
		selectAll('line')
			.data(lineCoords)
			.join('line')
			.attr('class', 'lines')
			.attr('x1', (d) => 0)
			.attr('y1', (d) => y(d))
			.attr('x2', (d) => width - mx)
			.attr('y2', (d) => y(d))
			.attr('stroke-dasharray', '10 10')
			.attr('opacity', '.3');
	}
	$: if (pinGRects) {
		selectAll('bruh')
			.data(events)
			.join('rect')
			.attr('class', 'events')
			.attr('x', (d) => 0)
			.attr('y', (d) => y(d.start))
			.attr('width', (d) => width - mx)
			.attr('height', (d) => {
				let startCoord = y(d.start);
				let endCoord = y(d.end);
				console.log(endCoord - startCoord);
				return endCoord - startCoord;
			})
			.attr('fill', 'steelblue')
			.attr('stroke-dasharray', '10 10')
			.attr('opacity', '.3');
	}
</script>

<svg width={svg_width} height={svg_height} class="m-4">
	<g class="yAxis font-mona text-lg" transform="translate({mx},{my})" bind:this={pinYAxis} />
	<g class="lines" bind:this={pinGLines} />
	<g class="mierdon" bind:this={pinGRects} />
</svg>
