<script>
	import Calendar from '../../lib/Components/Calendar.svelte';
	import Timeline from '../../lib/Components/Timeline.svelte';
	import { eventsFromTracks } from '../../lib/utils';
	import { token, tokenExpired } from '../../stores';

	async function getInfo() {
		const accessToken = $token;
		let data;
		const url = new URL('https://api.spotify.com/v1/me/player/recently-played');

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
</script>

{#await getInfo()}
	<p>loading...</p>
{:then data}
	<Timeline events={eventsFromTracks(data.items)} />
{/await}
