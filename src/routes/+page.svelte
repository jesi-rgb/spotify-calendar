<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import listWeek from '@event-calendar/list';

	let offsetZoom = 0;

	let plugins = [TimeGrid, DayGrid, listWeek];
	let options = {
		allDaySlot: false,

		height: '800px',
		slotMinTime: new Date(Date.parse(new Date()) - 60 * 1000 * 60).getHours() + ':00:00',
		// slotMaxTime: new Date(Date.parse(new Date()) + 60 * 1000 * 120).getHours() + ':00:00',
		slotDuration: 10 * 60, // in seconds
		slotLabelFormat: function (a) {
			return a.toLocaleTimeString([], { timeStyle: 'short' });
		},
		events: [
			{
				start: new Date(),
				end: new Date(Date.parse(new Date()) + 60 * 1000 * 30),
				title: 'Mierdón',
				color: '#234667'
			}
		],

		view: 'timeGridWeek',
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
		},
		titleFormat: function (t) {
			return 'Spotify Calendar';
		},
		selectable: true,
		views: {
			timeGridWeek: { pointer: true },
			resourceTimeGridWeek: { pointer: true }
		}
	};
</script>

<main class="m-10">
	<Calendar {plugins} {options} />
</main>

<style>
	.lol {
		background-color: #123456;
	}
</style>
