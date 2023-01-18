<script>
	import { scaleTime } from 'd3-scale';
	import { timeMinute } from 'd3-time';

	import { axisLeft } from 'd3-axis';
	import { select } from 'd3-selection';
	import { extent, max } from 'd3';

	let pinYAxis;
	let my = 20; // declare initial values for margin and svg_height/width
	let mx = 40; // declare initial values for margin and svg_height/width
	let svg_height = 3000;
	let svg_width = 600;
	$: height = svg_height - my * 2;
	$: width = svg_width - mx * 3;

	$: y = scaleTime()
		.domain([new Date().setHours(10), new Date().setHours(19)])
		.range([0, height])
		.nice();

	$: if (pinYAxis) {
		select(pinYAxis).call(axisLeft(y).ticks(timeMinute.every(5)));
	}
</script>

<svg width={svg_width} height={svg_height} class="m-4">
	<g class="yAxis font-mona" transform="translate({mx},{my})" bind:this={pinYAxis} />
</svg>
