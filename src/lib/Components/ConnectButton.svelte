<script>
	export let loginLink;
	export let rememberMe;
</script>

<div class="text-center mt-20">
	<a href={loginLink}>
		<button
			class="bg-gradient-to-tl rounded-xl px-4 py-2 text-lime-100 from-lime-800 to-lime-600 text-5xl lg:text-6xl font-bold font-widest tracking-tighter hover:scale-105 hover:bg-none hover:text-purple-100 hover:bg-purple-600 transition-all duration-700"
			>Connect to Spotify</button
		>
	</a>
	<br />
	<div class="mt-10">
		<input id="checkbox-box" name="remember-me" type="checkbox" bind:checked={rememberMe} />
		<label class="text-2xl" id="checkbox-text" for="remember-me">Remember me?</label>
	</div>
</div>

<style>
	:root {
		--shadow-color: #284106;
	}
	button {
		-webkit-filter: drop-shadow(5px 5px 0px var(--shadow-color));
		filter: drop-shadow(5px 5px 0px var(--shadow-color));
	}
</style>
