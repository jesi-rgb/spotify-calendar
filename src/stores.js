import { readable, writable } from 'svelte/store';

export const token = readable(null, function start(set) {
	const hashParams = {};
	const r = /([^&;=]+)=?([^&;]*)/g;
	const q = window.location.hash.substring(1);
	let e;
	while ((e = r.exec(q))) {
		hashParams[e[1]] = decodeURIComponent(e[2]);
	}
	const access_token = hashParams.access_token;
	set(access_token);
});

export const appUrl = readable(null, function start(set) {
	set('https://spotify-calendar.vercel.app');
	set('http://localhost:5173');
});

export const tokenExpired = writable(false);

export const seenDays = writable([new Date()]);
