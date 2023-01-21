export default function createEvents() {
	let days = [];
	for (let i = 0; i < 7; ++i) {
		let day = new Date();
		let diff = i - day.getDay();
		day.setDate(day.getDate() + diff);
		days[i] = day.getFullYear() + '-' + _pad(day.getMonth() + 1) + '-' + _pad(day.getDate());
	}

	return [
		{ start: days[0] + ' 00:00', end: days[0] + ' 09:00', resourceId: 1, display: 'background' },
		{ start: days[1] + ' 12:00', end: days[1] + ' 14:00', resourceId: 2, display: 'background' },
		{ start: days[2] + ' 17:00', end: days[2] + ' 24:00', resourceId: 1, display: 'background' },
		{
			start: days[0] + ' 10:00',
			end: days[0] + ' 14:00',
			resourceId: 1,
			title: 'The calendar can display background and regular events',
			color: '#FE6B64'
		},
		{
			start: days[1] + ' 16:00',
			end: days[2] + ' 08:00',
			resourceId: 2,
			title: 'An event may span to another day',
			color: '#B29DD9'
		},
		{
			start: days[2] + ' 09:00',
			end: days[2] + ' 13:00',
			resourceId: 2,
			title: 'Events can be assigned to resources and the calendar has the resources view built-in',
			color: '#779ECB'
		},
		{
			start: days[3] + ' 14:00',
			end: days[3] + ' 20:00',
			resourceId: 1,
			title: '',
			color: '#FE6B64'
		},
		{
			start: days[3] + ' 15:00',
			end: days[3] + ' 18:00',
			resourceId: 1,
			title: 'Overlapping events are positioned properly',
			color: '#779ECB'
		},
		{
			start: days[5] + ' 10:00',
			end: days[5] + ' 16:00',
			resourceId: 2,
			titleHTML: 'You have complete control over the <i><b>display</b></i> of events…',
			color: '#779ECB'
		},
		{
			start: days[5] + ' 14:00',
			end: days[5] + ' 19:00',
			resourceId: 2,
			title: '…and you can drag and drop the events!',
			color: '#FE6B64'
		},
		{
			start: days[5] + ' 18:00',
			end: days[5] + ' 21:00',
			resourceId: 2,
			title: '',
			color: '#B29DD9'
		}
	];
}

function _pad(num) {
	let norm = Math.floor(Math.abs(num));
	return (norm < 10 ? '0' : '') + norm;
}

export function generateRandomString(length) {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function shapeData(tracks) {
	if (tracks == undefined) return [];

	let events = tracks.map((t) => {
		let hour = new Date(t.played_at);
		let title = t.track.name;
		let artist = t.track.artists.map((a) => a.name).join(', ');

		let trackDuration = t.track.duration_ms;
		let trackLink = t.track.external_urls.spotify;

		return {
			start: hour,
			title: title,
			artists: artist,
			trackDuration: trackDuration,
			trackLink: trackLink
		};
	});

	return events;
}

export function eventsFromTracks(tracks) {
	if (tracks == undefined || tracks.length == 0) return [];

	let shapedData = shapeData(tracks).reverse();

	let events = [];
	for (let i = 0; i < shapedData.length - 1; i++) {
		const d = shapedData[i];
		const currentSongStart = d.start;
		const supposedEnd = new Date(Date.parse(currentSongStart) + d.trackDuration);
		// const supposedEnd = new Date(Date.parse(currentSongStart) + 30 * 1000);

		const nextSongStart = shapedData[i + 1].start;
		const supposedPrematureEnd = new Date(
			Date.parse(currentSongStart) + (Date.parse(nextSongStart) - Date.parse(currentSongStart))
		);

		let definitiveEnd = supposedPrematureEnd < supposedEnd ? supposedPrematureEnd : supposedEnd;

		events.push({
			start: currentSongStart,
			end: definitiveEnd,
			title: d.title,
			color: '#123456',
			duration: d.trackDuration,
			artists: d.artists
		});
	}

	return events;
}

export function dateFromHour(timeHours) {
	let hours = timeHours.split(':')[0];
	let minutes = timeHours.split(':')[1];
	let date = new Date();

	date.setHours(hours);
	date.setMinutes(minutes);
	return date;
}

import { token, tokenExpired } from '../stores';

export async function getInfo() {
	const accessToken = token;
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
			data = eventsFromTracks(data.items);
		} else {
			console.log('token expired');
			tokenExpired.set(true);
		}
	}
	return data;
}
