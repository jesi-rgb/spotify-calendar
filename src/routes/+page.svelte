<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import listWeek from '@event-calendar/list';

	let offsetZoom = 0;

	let plugins = [TimeGrid, DayGrid, listWeek];
	let options = {
		allDaySlot: false,

		slotMinTime: new Date(Date.parse(new Date()) - 60 * 1000 * 60).getHours() + ':00:00',
		slotMaxTime: new Date(Date.parse(new Date()) + 60 * 1000 * 120).getHours() + ':00:00',
		slotDuration: 8 * 60, // in seconds
		slotLabelFormat: function (a) {
			return a.toLocaleTimeString([], { timeStyle: 'short' });
		},
		events: [
			{
				start: new Date(),
				end: new Date(Date.parse(new Date()) + 60 * 1000 * 30),
				title: 'Mierdón'
			}
		],

		view: 'timeGridWeek'
	};

	function updateZoom() {
		options.slotDuration += offsetZoom;
	}
</script>

<main class="m-10">
	<Calendar {plugins} {options} />
	<input on:mousewheel={updateZoom()} type="range" bind:value={offsetZoom} min={0} max={100} />
</main>
