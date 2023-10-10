import { msg, gPlural, msgPlural } from '$lib';

const msgText = msg`defineMessage text`;
const gPluralText = (count = 2 + 3) =>
	gPlural(count, {
		'=5': 'five items',
		one: '# item',
		other: '# items'
	});

const msgPluralText = msgPlural({
	one: '# item',
	other: '# items'
});

export async function load() {
	return {
		msgText,
		gPluralText,
		msgPluralText
	};
}
