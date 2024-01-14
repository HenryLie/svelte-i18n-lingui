<script>
  import { locale } from '$lib';
  import { setLocale } from '../helpers/util';

  export let data;

  let isInitialized = false;
  setLocale(data.lang).then(() => isInitialized = true)

</script>

{#if isInitialized}
  {#key $locale}
    <slot/>
  {/key}
{/if}
