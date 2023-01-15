<script>
	const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
	const client_secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

	import { token, tokenExpired, appUrl } from '../stores';
	import { generateRandomString } from './utils';

	const url = new URL('https://accounts.spotify.com/authorize?');
	const scope = 'user-read-private user-read-recently-played user-read-email user-top-read';
	const state = generateRandomString(16);
	let rememberMe = true;

	$: params = new URLSearchParams({
		response_type: 'token',
		show_dialog: !rememberMe, // Will show up on first sign-on regardless
		client_id,
		scope,
		redirect_uri: $appUrl,
		state
	});
	$: loginLink = url + params;
</script>

{#if !$token}
	<div class="text-center mt-20">
		<a href={loginLink}>
			<button class="text-6xl">Connect to Spotify</button>
		</a>
		<br />
		<div class="mt-10">
			<input id="checkbox-box" name="remember-me" type="checkbox" bind:checked={rememberMe} />
			<label class="text-2xl" id="checkbox-text" for="remember-me">Remember me?</label>
		</div>
	</div>
{/if}

{#if $tokenExpired}
	<section class="expired-token">
		<p>Token expired! Please log out and log back in again.</p>
		<a href={$appUrl}>
			<button>Logout</button>
		</a>
	</section>
{/if}
