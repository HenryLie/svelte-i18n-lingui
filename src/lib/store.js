import { writable, derived } from 'svelte/store';
import { i18n } from '@lingui/core';
import { messages as defaultMessages } from '../locales/en.ts';

function createLocale() {
	const defaultLocale = 'en';
	const { subscribe, set } = writable(defaultLocale);
	i18n.loadAndActivate({ locale: defaultLocale, messages: defaultMessages });

	return {
		subscribe,
		set: async (locale) => {
			const { messages } = await import(`../locales/${locale}.ts`);
			i18n.loadAndActivate({ locale, messages });
			set(locale);
		}
	};
}
export const locale = createLocale();

export const t = derived(locale, () => (strings, ...args) => {
	// For parsing defineMsg directly through "$t(variableName)"
	if (typeof strings === 'string') {
		return i18n.t(/*i18n*/ { id: strings, message: strings });
	}

	let message = strings[0];
	args.forEach((_arg, i) => {
		message += `{${i}}` + strings[i + 1];
	});
	const values = { ...args };

	return i18n.t(/*i18n*/ { id: message, message, values });
});

export const g = (strings, ...args) => {
	// TODO: Extract this part to a reusable function
	let message = strings[0];
	args.forEach((_arg, i) => {
		message += `{${i}}` + strings[i + 1];
	});
	const values = { ...args };

	return i18n.t(/*i18n*/ { id: message, message, values });
};

export const msg = (strings, ...args) => String.raw({ raw: strings }, ...args);

export const plural = derived(locale, () => (num, variations) => {
	let pluralOptions = '';
	Object.entries(variations).forEach(([key, value]) => {
		pluralOptions += ` ${key} {${value}}`;
	});
	const message = `{num, plural,${pluralOptions}}`;

	return i18n.t(/*i18n*/ { id: message, message, values: { num } });
});
