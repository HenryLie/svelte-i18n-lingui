<script>
	import { locale, t } from '$lib/store.js';
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<button on:click={() => locale.set('en')}>en</button>
<button on:click={() => locale.set('ja')}>ja</button>

<p>Current locale: {$locale}</p>
<p>Translated text: {$t`hello`}</p>
