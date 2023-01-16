<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import ListWeek from '@event-calendar/list';
	import Interaction from '@event-calendar/interaction';
	import { token, tokenExpired } from '../stores';

	import { eventsFromTracks } from '../lib/utils';
	import { onMount } from 'svelte';

	$: options = {
		allDaySlot: false,
		view: 'timeGridDay',
		height: '650px',
		headerToolbar: {
			start: 'prev,next today',
			center: '',
			end: 'title'
		},
		slotDuration: 1 * 60,
		// scrollTime: eventsFromTracks(data)[0].start,
		displayEventEnd: true,
		views: {
			timeGridWeek: { pointer: true },
			resourceTimeGridWeek: { pointer: true }
		},
		dayMaxEvents: true,
		nowIndicator: true,

		longPressDelay: 200
	};

	async function getInfo() {
		const accessToken = $token;
		let data;
		const url = new URL('https://api.spotify.com/v1/me/player/recently-played');
		// const params = new URLSearchParams({
		// 	before: new Date().getMilliseconds()
		// });
		if (accessToken) {
			const res = await fetch(url, {
				headers: {
					Authorization: 'Bearer ' + accessToken
				}
			});
			if (res.ok) {
				data = await res.json();
				options.events = eventsFromTracks(data.items);
			} else {
				console.log('mierdón');
				tokenExpired.set(true);
			}
		}
		return data;
	}

	let plugins = [TimeGrid, DayGrid, ListWeek, Interaction];

	onMount(getInfo);
</script>

<svelte:window
	on:keydown={(e) => {
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
	}}
/>

<main class="m-3 lg:m-10">
	<Calendar {plugins} {options} />

	<!-- {#if tracks != undefined}
			{#each tracks as item}
				<p>{item.track.name}</p>
			{/each}
		{/if} -->
</main>
