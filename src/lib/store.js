import { writable, derived } from 'svelte/store';
import { i18n } from '@lingui/core';
import { messages as defaultMessages } from '../locales/en.ts';
import { generateMessageId } from './generateMessageId.js';

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

const processTaggedLiteral = (strings, ...args) => {
	let message = strings[0];
	args.forEach((_arg, i) => {
		message += `{${i}}` + strings[i + 1];
	});
	const id = generateMessageId(message);
	const values = { ...args };

	return i18n.t({ id, message, values });
};

export const t = derived(locale, () => (strings, ...args) => {
	// TODO: Include this in the base logic, this is also needed on g
	// For parsing defineMsg directly through "$t(variableName)"
	if (typeof strings === 'string') {
		const id = generateMessageId(strings);
		return i18n.t({ id, message: strings });
	}

	// TODO: check if type is MessageDescriptor
	return processTaggedLiteral(strings, ...args);
});

export const g = (strings, ...args) => {
	return processTaggedLiteral(strings, ...args);
};

export const msg = (strings, ...args) => String.raw({ raw: strings }, ...args);

export const plural = derived(locale, () => (num, variations) => {
	let pluralOptions = '';
	Object.entries(variations).forEach(([key, value]) => {
		pluralOptions += ` ${key} {${value}}`;
	});
	const message = `{num, plural,${pluralOptions}}`;

	return i18n.t({ id: generateMessageId(message), message, values: { num } });
});
