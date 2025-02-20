<script>
	import { locale, t, msg, plural } from '$lib';
	import { getText } from '../fixtures/random.ts';
	import T from '$lib/T.svelte';
	import LegacyT from '$lib/LegacyT.svelte';
	import TestComponent from '../fixtures/TestComponent.svelte';

	let { data } = $props();

	const { msgText, gPluralText, msgPluralText } = data;

	let count = $state(0);

	let local = $state();

	const msgInSvelte = msg`msgSvelte`;

	$effect(() => {
		$locale;
		count;
		local = getText();
	});

	let consumeMsg = $derived($t(msgInSvelte));

	async function setLocale(lang) {
		const { messages } = await import(`../locales/${lang}.ts`);
		locale.set(lang, messages);
	}
</script>

<h2>Current locale: {$locale}</h2>

<button onclick={() => setLocale('en')}>en</button>
<button onclick={() => setLocale('ja')}>ja</button>
<p>
	Count: {count}
	<button onclick={() => count++}>increment count</button>
	<button onclick={() => count--}>decrement count</button>
</p>

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

<p>
	Plurals: {$plural(count, {
		one: 'There is # message.',
		other: 'There are # messages.',
	})}
</p>
<p>
	GPlurals:
	{#key $locale}
		{gPluralText(count)}
	{/key}
</p>
<p>
	Define plural: {$plural(count, msgPluralText)}
</p>
<p>
	Context:
	<br />
	{$t({
		message: 'Message with context',
		context: 'A',
	})}

	<br />
	{$t({
		message: 'Message with context',
		context: 'B',
	})}
</p>
<p>
	Comment: {$t({ message: 'Commented message', comment: 'This is a comment for the translator' })}
</p>
<p>
	Interpolation inside component:<br />
	<T msg="Click # to learn more" ctx="ABC" cmt="Comment for translator">
		<a href="https://svelte.dev/tutorial" target="_blank">{$t`Svelte tutorial`}</a>
	</T>
	<br />
	<T msg="Click # to learn more" ctx="ABC" cmt="Comment for translator">
		<TestComponent />
	</T>
	<br />
	<T msg="Click # here # to # learn # more #" ctx="ABC" cmt="Comment for translator">
		<span>1</span>
		{#snippet second()}2{/snippet}
		{#snippet third()}3{/snippet}
		{#snippet fourth()}4{/snippet}
		{#snippet fifth()}5{/snippet}
	</T>
	<br />
	Legacy T:
	<LegacyT msg="Click # here # to # learn # more #" ctx="ABC" cmt="Comment for translator">
		<span>0</span>
		<span slot="1">1</span>
		<span slot="2">2</span>
		<span slot="3">3</span>
		<span slot="4">4</span>
	</LegacyT>
	<br />
	Whitespace test:
	<T msg="Click # to learn more">{$t`hello`}</T><T msg="Click # to learn more">{$t`hello`}</T>
</p>

<!-- Future features -->
<p>Select</p>
<p>Datetime</p>
<p>Number</p>
<!-- NOTE: Might need to extract the variable name used to pass in the number -->
<!--  so that it can be differentiated from the nested plural number -->
<p>
	Nested Plurals:
	<!--  {$plural(count, { -->
	<!-- 	one: 'There is a message.', -->
	<!-- 	other: $plural(count, { -->
	<!-- 		'=2': 'There are two messages', -->
	<!-- 		other: 'There are other than two messages' -->
	<!-- 	}) -->
	<!-- })} -->
</p>
