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

const processTaggedLiteral = (descriptor, ...args) => {
	// For parsing plain strings marked by defineMessage (msg``)"
	if (typeof descriptor === 'string') {
		const id = generateMessageId(descriptor);
		return i18n.t({ id, message: descriptor });
	}

	if ('message' in descriptor) {
		const id = generateMessageId(descriptor.message, descriptor.context);
		return i18n.t({ id, ...descriptor });
	}

	let message = descriptor[0];
	args.forEach((_arg, i) => {
		message += `{${i}}` + descriptor[i + 1];
	});
	const id = generateMessageId(message);
	const values = { ...args };

	return i18n.t({ id, message, values });
};

export const t = derived(
	locale,
	() =>
		(descriptor, ...args) =>
			processTaggedLiteral(descriptor, ...args)
);

export const g = (descriptor, ...args) => processTaggedLiteral(descriptor, ...args);

export const msg = (strings, ...args) => String.raw({ raw: strings }, ...args);

export const plural = derived(locale, () => (num, variations) => {
	let pluralOptions = '';
	Object.entries(variations).forEach(([key, value]) => {
		pluralOptions += ` ${key} {${value}}`;
	});
	const message = `{num, plural,${pluralOptions}}`;

	return i18n.t({ id: generateMessageId(message), message, values: { num } });
});
