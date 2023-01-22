<script>
	import { onMount } from 'svelte';
	import LoadingScreen from '../../lib/Components/LoadingScreen.svelte';
	import Timeline from '../../lib/Components/Timeline.svelte';
	import { eventsFromTracks } from '../../lib/utils';
	import { token, tokenExpired } from '../../stores';

	async function getInfo() {
		let data;
		const accessToken = $token;
		const url = new URL('https://api.spotify.com/v1/me/player/recently-played?limit=50');

		if (accessToken) {
			const res = await fetch(url, {
				headers: {
					Authorization: 'Bearer ' + accessToken
				}
			});
			if (res.ok) {
				data = await res.json();
			} else {
				tokenExpired.set(true);
			}
		}
		return data;
	}
	getInfo();
</script>

{#await getInfo()}
	<LoadingScreen />
{:then data}
	<Timeline events={eventsFromTracks(data.items)} />
{/await}
