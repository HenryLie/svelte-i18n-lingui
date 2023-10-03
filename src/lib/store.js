import { writable, derived } from 'svelte/store';
import { i18n } from '@lingui/core';

function createLocale() {
	const { subscribe, set } = writable('en');

	return {
		subscribe,
		set: async (locale) => {
			const { messages } = await import(`/src/locales/${locale}.ts`);
			i18n.load(locale, messages);
			i18n.activate(locale);
			set(locale);
		}
	};
}
export const locale = createLocale();

export const t = derived(locale, () => (val, ...args) => {
	let message = val[0];
	args.forEach((_arg, i) => {
		message += `{${i}}` + val[i + 1];
	});
	const values = { ...args };

	return i18n.t(/*i18n*/ { id: message, message, values });
});
