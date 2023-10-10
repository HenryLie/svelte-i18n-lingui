/**
 * MessageDescriptor object to describe a message with optional context and comment.
 * @typedef {Object} MessageDescriptor
 * @property {string} message - The message to be translated.
 * @property {string} [context] - The context of the message, will be included in the po file. The same message with different context will be extracted as separate entries, and can be translated differently.
 * @property {string} [comment] - A comment purely for giving information to the translator, won't affect translated string.
 */

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

const buildPluralMessages = (variations) => {
	let pluralOptions = '';
	Object.entries(variations).forEach(([key, value]) => {
		pluralOptions += ` ${key} {${value}}`;
	});
	return `{num, plural,${pluralOptions}}`;
};

const processPlural = (num, variations) => {
	const message = buildPluralMessages(variations);
	const id = generateMessageId(message);
	return i18n.t({ id, message, values: { num } });
};

/**
 * A Svelte store that subscribes to locale changes and returns a function that can be used to translate messages.
 * @param {string | MessageDescriptor} descriptor - A tagged template literal, plain string, or a MessageDescriptor object.
 * @returns {string} The message translated to the currently active locale.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { t } from 'svelte-i18n-lingui/store';
 * </script>
 *
 * {$t`Hello World`}
 * ```
 */
export const t = derived(locale, () => processTaggedLiteral);

/**
 * A function that takes a message and returns a translated message based on the currently active locale.
 * Useful outside of Svelte components, as an alternative to accessing the store value with `get(t)`.
 * @param {string | MessageDescriptor} descriptor - A tagged template literal, plain string, or a MessageDescriptor object.
 * @returns {string} The message translated to the currently active locale.
 *
 * Usage:
 * ```js
 * import { g } from 'svelte-i18n-lingui/store';
 *
 * const hello = g`Hello World`;
 * ```
 */
export const gt = processTaggedLiteral;

/**
 * A function that takes a message and returns it as is, while marking the message for extraction.
 * Useful for pregaring messages to be translated at runtime based on the currently active locale.
 * @param {string | MessageDescriptor} descriptor - A tagged template literal, plain string, or a MessageDescriptor object.
 * @returns {string} The message translated to the currently active locale.
 *
 * Usage:
 * ```js
 * import { msg } from 'svelte-i18n-lingui/store';
 *
 * const hello = msg`Hello World`;
 * ```
 */
export const msg = (descriptor, ...args) => {
	// If MessageDescriptor is passed, return it as is as the object is a valid descriptor for t or g.
	if ('message' in descriptor) {
		return descriptor;
	}
	// Otherwise, return the processed template literal as a string.
	return String.raw({ raw: descriptor }, ...args);
};

export const msgPlural = (variations) => variations;

export const plural = derived(locale, () => processPlural);
export const gPlural = processPlural;
