<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { t } from '$lib';

	let shown = $state(false);
	onMount(() => {
		const timeout = setInterval(() => {
			shown = !shown;
		}, 1000);

		return () => clearInterval(timeout);
	});
</script>

{#if shown}
	<span transition:fade={{ duration: 1001 }}>
		{t`hello`}
	</span>
{/if}

<style>
	span {
		color: red;
	}
</style>
