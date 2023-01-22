import { token, tokenExpired, seenDays } from '../stores';
import { get } from 'svelte/store';
import { eventsFromTracks } from '../lib/utils';

export async function getInfo() {
	const accessToken = get(token);
	let data;
	let url = new URL('https://api.spotify.com/v1/me/player/recently-played?');
	let params = new URLSearchParams({
		after: new Date().setHours(0)
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
		} else {
			console.log(res.statusText);
			tokenExpired.set(true);
		}
	}
	return data;
}

async function fetchDataBefore(before) {
	let accessToken = get(token);
	let url = new URL('https://api.spotify.com/v1/me/player/recently-played?');

	let urlParams;
	if (before !== undefined && !isNaN(before)) {
		urlParams = new URLSearchParams({ before: before });
	}

	url += urlParams;

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

export async function trackAndFetchIncomingDates(events, ticks) {
	let targetDate = events[0].start;
	let seenDaysRef = get(seenDays);

	for (let i = 0; i < ticks.length; i++) {
		let t = ticks[i];

		if (t <= targetDate && !seenDaysRef.includes(targetDate)) {
			seenDays.set([...seenDaysRef, targetDate]);
			console.log(seenDaysRef);
			console.log('[trackIncomingDates] FETCHING DATA BEFORE ' + targetDate);
			return await fetchDataBefore(Date.parse(targetDate));

			// return [];
		}
	}
	return [];
}
export function nextBatchOfTracks(events) {
	let beforeFetch = new Date(events[0].start);

	return fetchDataBefore(beforeFetch) || ['a', 'a'];
}
