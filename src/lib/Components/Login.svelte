<script>
	import { onMount } from 'svelte';

	const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

	import { token, tokenExpired, appUrl } from '../../stores';
	import { generateRandomString } from '../utils';
	import ConnectButton from './ConnectButton.svelte';

	const url = new URL('https://accounts.spotify.com/authorize?');
	const scope = 'user-read-private user-read-recently-played user-read-email user-top-read';
	const state = generateRandomString(16);
	let rememberMe = true;

	$: params = new URLSearchParams({
		response_type: 'token',
		show_dialog: !rememberMe, // Will show up on first sign-on regardless
		client_id,
		scope,
		redirect_uri: $appUrl + '/timeline',
		state
	});
	$: loginLink = url + params;

	onMount(() => {
		if ($token) {
			window.location.href = $appUrl + '/timeline';
		}
	});
</script>

{#if !$token}
	<div class="text-center my-20">
		<div
			class="title font-widest font-extrabold mb-5 tracking-tight bg-gradient-to-l from-lime-900 to-lime-500 bg-clip-text text-6xl text-transparent md:text-7xl"
		>
			Spotify Calendar
		</div>

		<div class="text-3xl lg:text-4xl text-lime-900">A novel way to think about your playlists</div>
	</div>
	<p class="max-w-sm text-xl mx-auto text-justify leading-tight">
		Spotify Calendar allows you to see your recently played tracks in a calendar format, similar to
		events you'd find in your typical day. Just log in and take a look at your busy day!
	</p>
	<ConnectButton {loginLink} {rememberMe} />
{/if}

{#if $tokenExpired}
	<section class="expired-token">
		<p>Token expired! Please log out and log back in again.</p>
		<a href={$appUrl}>
			<button>Logout</button>
		</a>
	</section>
{/if}
