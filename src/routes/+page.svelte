<script>
	import { locale, t, msg } from '$lib/store.js';
	import { getText } from '$lib/random.ts';

	export let data;

	const { msgText } = data;

	let local;

	const msgInSvelte = msg`msgSvelte`;

	$: {
		$locale;
		local = getText();
		let a = 'abc';
	}

	$: consumeMsg = $t(msgInSvelte);
</script>

<h2>Current locale: {$locale}</h2>

<button on:click={() => locale.set('en')}>en</button>
<button on:click={() => locale.set('ja')}>ja</button>

<p>Translated text: {$t`hello`}</p>
<p>Parameterized translated text: {$t`Hello, ${$t`world`}!`}</p>
<p>
	Extract from js/ts files: {local}
</p>
<p>
	DefineMessage text import: {$t(msgText)}
</p>
<p>
	Parameterized defineMessage text import: {$t`Hello, ${$t(msgText)}!`}
</p>
<p>DefineMessage in Svelte files: {consumeMsg}</p>
<p>Plurals</p>
<p>Context</p>
<!--TODO: try using recursive tagged template literal for comments? -->
<p>Comment</p>
