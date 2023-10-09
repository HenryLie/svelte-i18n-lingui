import { writable, derived } from 'svelte/store';
import { i18n } from '@lingui/core';
// TODO: How to customize this based on user's default language preference,
// and load them synchronously?
//
// Idea1: prepare a cli command to bootstrap the project to generate a sample file for all locales.
// Also prepare the lingui config as well.
//
// Idea2: export the createLocale function and let the user customize it.
// The exported store code will just subscribe from the user's customized store.
// Need to warn the user that any async code might cause issues with load function timing.
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

const processPlural = (num, variations) => {
	let pluralOptions = '';
	Object.entries(variations).forEach(([key, value]) => {
		pluralOptions += ` ${key} {${value}}`;
	});
	const message = `{num, plural,${pluralOptions}}`;

	return i18n.t({ id: generateMessageId(message), message, values: { num } });
};

export const msg = (descriptor, ...args) => {
	// If MessageDescriptor is passed, return it as is as the object is a valid descriptor for t or g.
	if ('message' in descriptor) {
		return descriptor;
	}
	// Otherwise, return the processed template literal as a string.
	return String.raw({ raw: descriptor }, ...args);
};

export const t = derived(locale, () => processTaggedLiteral);
export const g = processTaggedLiteral;

export const plural = derived(locale, () => processPlural);
export const gplural = processPlural;
