<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import ListWeek from '@event-calendar/list';
	import Interaction from '@event-calendar/interaction';

	function onKeyDown(e) {
		switch (e.key) {
			case 'm':
				options.view = 'dayGridMonth';
				break;
			case 'w':
				options.view = 'timeGridWeek';
				break;
			case 'd':
				options.view = 'timeGridDay';
				break;
			case 'l':
				options.view = 'listDay';
				break;
			case 't':
				options.view = 'today';

			default:
				options.view = options.view;
		}
	}

	let plugins = [TimeGrid, DayGrid, ListWeek, Interaction];
	let options = {
		allDaySlot: false,
		view: 'timeGridDay',
		height: '650px',
		headerToolbar: {
			start: 'prev,next today',
			center: '',
			end: 'title'
		},
		slotDuration: 10 * 60,
		scrollTime: new Date(),
		displayEventEnd: true,
		events: [
			{
				start: new Date(),
				end: new Date(Date.parse(new Date()) + 60 * 1000 * 30),
				title: 'Mierdón',
				color: '#234667'
			},
			{
				start: new Date(Date.parse(new Date()) + 60 * 1000 * 40),
				end: new Date(Date.parse(new Date()) + 60 * 1000 * 90),
				title: 'Mierdón',
				color: '#234667'
			}
		],
		views: {
			timeGridWeek: { pointer: true },
			resourceTimeGridWeek: { pointer: true }
		},
		dayMaxEvents: true,
		nowIndicator: true,
		selectable: true
	};
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />
<main class="m-3 lg:m-10">
	<Calendar {plugins} {options} />
</main>
