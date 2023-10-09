import { msg, gPlural, definePlural } from '$lib/store.js';

const msgText = msg`defineMessage text`;
const gPluralText = (count = 2 + 3) =>
	gPlural(count, {
		'=5': 'five items',
		one: '# item',
		other: '# items'
	});

const definePluralText = definePlural({
	one: '# item',
	other: '# items'
});

export async function load() {
	return {
		msgText,
		gPluralText,
		definePluralText
	};
}
