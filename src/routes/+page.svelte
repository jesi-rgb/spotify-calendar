<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';

	let plugins = [TimeGrid];
	let options = {
		allDaySlot: false,
		view: 'timeGridWeek',
		pointer: true,
		editable: true,
		eventDurationEditable: true,
		nowIndicator: true,
		eventMouseEnter: function (info) {
			console.log(info);
		},
		// slotMinTime: new Date(Date.parse(new Date()) - 60 * 1000 * 50),
		// slotMaxTime: new Date(Date.parse(new Date()) + 60 * 1000 * 50),
		// slotDuration: '00:10',
		events: [
			// your list of events
			{
				start: new Date(),
				end: new Date(Date.parse(new Date()) + 60 * 1000 * 30),
				title: 'Mierdón'
			}
		]
	};
	function updateOptions() {
		options.slotDuration = '00:10';
	}
</script>

<button on:click={updateOptions}>Change slot duration</button>
<Calendar {plugins} {options} />
