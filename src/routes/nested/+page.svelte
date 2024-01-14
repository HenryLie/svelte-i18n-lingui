<script>
  import { locale, t } from '$lib';
  import { setLocale } from '../../helpers/util';

</script>

<a href="/">HOME</a>
<a href="/nested">Nested</a>
<a href="/nested2">Nested2</a>

{t`hello`}

<h2>Current locale: {$locale}</h2>

<button on:click={() => setLocale('en')}>en</button>
<button on:click={() => setLocale('ja')}>ja</button>
