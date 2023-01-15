<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import ListWeek from '@event-calendar/list';
	import Interaction from '@event-calendar/interaction';
	import { token, tokenExpired } from '../stores';
	// import { tracks } from '../items';
	import { onMount } from 'svelte';

	import { eventsFromTracks } from '../lib/utils';
	import { tracks } from '../items';

	// let events = [];
	// async function getInfo() {
	// 	const accessToken = $token;
	// 	const url = new URL('https://api.spotify.com/v1/me/player/recently-played');
	// 	const params = new URLSearchParams({
	// 		before: new Date().getMilliseconds()
	// 	});
	// 	if (accessToken) {
	// 		const res = await fetch(url, {
	// 			headers: {
	// 				Authorization: 'Bearer ' + accessToken
	// 			}
	// 		});
	// 		if (res.ok) {
	// 			let data = await res.json();
	// 			tracks = data.items;
	// 			events = eventsFromTracks(tracks);
	// 		} else {
	// 			tokenExpired.set(true);
	// 		}
	// 	}

	// 	// if (tracks == undefined) {
	// 	// 	window.location.href = '/login';
	// 	// }
	// }

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
		slotDuration: 0.5 * 60,
		scrollTime: eventsFromTracks(tracks)[0].start,
		displayEventEnd: true,
		events: eventsFromTracks(tracks),
		views: {
			timeGridWeek: { pointer: true },
			resourceTimeGridWeek: { pointer: true }
		},
		dayMaxEvents: true,
		nowIndicator: true,

		longPressDelay: 200
	};
</script>

<svelte:window on:keydown={onKeyDown} />
<main class="m-3 lg:m-10">
	<Calendar {plugins} {options} />

	{#if tracks != undefined}
		{#each tracks as item}
			<p>{item.track.name}</p>
		{/each}
	{/if}
</main>
