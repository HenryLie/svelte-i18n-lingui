<script>
	import { locale, t, msg, plural } from '$lib';
	import { getText } from '../fixtures/random.ts';
	import T from '$lib/T.svelte';
	import TestComponent from '../fixtures/TestComponent.svelte';
	import { setLocale } from '../helpers/util';

	export let data;

	const { msgText, gPluralText, msgPluralText } = data;

	let count = 0;

	let local;

	const msgInSvelte = msg`msgSvelte`;

	$: {
		$locale;
		count;
		local = getText();
	}

	// NOTE: No longer working.
	// This is no longer tracked by the $locale key since it isn't a store anymore
	$: consumeMsg = t(msgInSvelte);
</script>

	<a href="/">HOME</a>
	<a href="/nested">Nested</a>
	<a href="/nested2">Nested2</a>

	<h2>Current locale: {$locale}</h2>

	<button on:click={() => setLocale('en')}>en</button>
	<button on:click={() => setLocale('ja')}>ja</button>
	<p>
		Count: {count}
		<button on:click={() => count++}>increment count</button>
		<button on:click={() => count--}>decrement count</button>
	</p>

	<p>Translated text: {t`hello`}</p>
	<p>Parameterized translated text: {t`Hello, ${t`world`}!`}</p>
	<p>
		Extract from js/ts files: {local}
	</p>
	<p>
		DefineMessage text import: {t(msgText)}
	</p>
	<p>
		Parameterized defineMessage text import: {t`Hello, ${t(msgText)}!`}
	</p>
	<p>DefineMessage in Svelte files: {consumeMsg}</p>

	<p>
		Plurals: {plural(count, {
			one: 'There is # message.',
			other: 'There are # messages.'
		})}
	</p>
	<p>
		GPlurals:
		{#key $locale}
			{gPluralText(count)}
		{/key}
	</p>
	<p>
		Define plural: {plural(count, msgPluralText)}
	</p>
	<p>
		Context:
		<br />
		{t({
			message: 'Message with context',
			context: 'A'
		})}

		<br />
		{t({
			message: 'Message with context',
			context: 'B'
		})}
	</p>
	<p>
		Comment: {t({ message: 'Commented message', comment: 'This is a comment for the translator' })}
	</p>
	<p>
		Interpolation inside component:
		<T msg="Click # to learn more" ctx="ABC" cmt="Comment for translator">
			<a href="https://svelte.dev/tutorial" target="_blank">{t`Svelte tutorial`}</a>
		</T>
		<br />
		<T msg="Click # to learn more" ctx="ABC" cmt="Comment for translator">
			<TestComponent />
		</T>
		<br />
		<T msg="Click .##. to .#. learn .#. more .#." ctx="ABC" cmt="Comment for translator">
			<span>0</span>
			<span slot="1">1</span>
			<span slot="2">2</span>
			<span slot="3">3</span>
			<span slot="4">4</span>
		</T>
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
