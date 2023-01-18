<script>
	import { scaleTime } from 'd3-scale';
	import { timeMinute } from 'd3-time';

	import { axisLeft } from 'd3-axis';
	import { select } from 'd3-selection';
	import { extent, max } from 'd3';
	import { zoom } from 'd3-zoom';

	export let timeResolution = 5;
	export let my = 20;
	export let mx = 40;

	let pinYAxis;
	let svg_height = 3000;
	let svg_width = 600;

	$: height = svg_height - my * 2;
	$: width = svg_width - mx * 3;

	$: y = scaleTime()
		.domain([new Date().setHours(10), new Date().setHours(19)])
		.range([0, height])
		.nice();

	$: yAxis = axisLeft(y).ticks(timeMinute.every(timeResolution));

	const zoomBehaviour = zoom().scaleExtent([1, 30]).filter(filter).on('zoom', zoomed);

	function filter(event) {
		return (!event.ctrlKey || event.type === 'wheel') && !event.button;
	}
	function zoomed({ transform }) {
		select(pinYAxis).call(yAxis.scale(transform.rescaleY(y)));
	}

	$: if (pinYAxis) {
		select(pinYAxis).call(yAxis).call(zoomBehaviour.on('zoom', zoomed));
	}
</script>

<svg width={svg_width} height={svg_height} class="m-4">
	<g class="yAxis font-mona" transform="translate({mx},{my})" bind:this={pinYAxis} />
</svg>
