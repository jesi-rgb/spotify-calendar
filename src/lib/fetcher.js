import { token, tokenExpired, seenDays, events } from '../stores';
import { get } from 'svelte/store';
import { eventsFromTracks } from '../lib/utils';

export async function getInfo() {
	const accessToken = get(token);
	let data;
	let url = new URL('https://api.spotify.com/v1/me/player/recently-played?');
	let params = new URLSearchParams({
		limit: 50
	});

	url += params;

	if (accessToken) {
		const res = await fetch(url, {
			headers: {
				Authorization: 'Bearer ' + accessToken
			}
		});
		if (res.ok) {
			data = await res.json();
			events.set(eventsFromTracks(data.items));
		} else {
			console.log(res.statusText);
			tokenExpired.set(true);
		}
	}
}

async function fetchDataBefore(before) {
	console.log(before);
	let accessToken = get(token);
	let url = new URL('https://api.spotify.com/v1/me/player/recently-played?');

	let params = { limit: 50 };
	if (before !== undefined && !isNaN(before)) {
		params.before = before;
	}

	let urlParams = new URLSearchParams(params);
	url += urlParams;
	console.log(url);

	let data;
	if (accessToken) {
		const res = await fetch(url, {
			headers: {
				Authorization: 'Bearer ' + accessToken
			}
		});
		if (res.ok) {
			data = await res.json();
		} else {
			console.log(res.statusText);
			tokenExpired.set(true);
		}
	}
	return data.items;
}

export async function trackAndFetchIncomingDates(ticks) {
	let seenDaysRef = get(seenDays);
	let eventsRef = get(events);
	let targetDate = Date.parse(eventsRef[0]?.start);

	let newEvents;
	for (let i = 0; i < ticks.length; i++) {
		let t = Date.parse(ticks[i]);

		if (t <= targetDate && !seenDaysRef.includes(targetDate)) {
			seenDays.set([...seenDaysRef, targetDate]);
			newEvents = await fetchDataBefore(targetDate);
			break;
		}
	}

	if (newEvents) {
		console.log('FETCHING before ' + new Date(targetDate), eventsRef);

		events.set(eventsFromTracks(newEvents).concat(eventsRef));
	}
}
export function nextBatchOfTracks(events) {
	let beforeFetch = new Date(events[0].start);

	return fetchDataBefore(beforeFetch) || ['a', 'a'];
}
