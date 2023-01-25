<script>
	import LoadingScreen from '../../lib/Components/LoadingScreen.svelte';
	import Timeline from '../../lib/Components/Timeline.svelte';
	// import { eventsFromTracks } from '../../lib/utils';
	// import { tracks } from '../../items';

	import { getInfo } from '../../lib/fetcher';
</script>

{#await getInfo()}
	<LoadingScreen />
{:then data}
	<Timeline />
{/await}
