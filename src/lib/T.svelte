<script>
	import { generateMessageId } from './generateMessageId.js';
	import { locale, t } from '$lib/store';
	/**
	 * @type {string}
	 */
	export let msg;
	/**
	 * @type {string}
	 */
	export let ctx = undefined;
	/**
	 * @type {string}
	 */
	export let cmt = undefined;

	$: [beforeSlot, afterSlot] = $t({
		message: msg,
		context: ctx,
		comment: cmt
	}).split('#');
</script>

{beforeSlot}<slot />{afterSlot}
