import { msg, gplural } from '$lib/store.js';

const msgText = msg`defineMessage text`;
const gPluralText = (count = 2 + 3) =>
	gplural(count, {
		'=5': 'five items',
		one: '# item',
		other: '# items'
	});

export async function load() {
	return {
		msgText,
		gPluralText
	};
}
