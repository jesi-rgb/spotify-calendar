<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import ListWeek from '@event-calendar/list';
	import Interaction from '@event-calendar/interaction';
	import { token, tokenExpired } from '../stores';
	import { onMount } from 'svelte';

	let tracks;
	async function getInfo() {
		const accessToken = $token;
		const url = new URL('https://api.spotify.com/v1/me/player/recently-played');
		const params = new URLSearchParams({
			before: new Date().getMilliseconds()
		});
		if (accessToken) {
			const res = await fetch(url, {
				headers: {
					Authorization: 'Bearer ' + accessToken
				}
			});
			if (res.ok) {
				let data = await res.json();
				tracks = data.items;
				console.log(tracks);
			} else {
				tokenExpired.set(true);
			}
		}
		if (tracks == undefined) {
			window.location.href = '/login';
		}
	}
	onMount(getInfo);

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
