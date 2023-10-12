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
import { generateMessageId } from './generateMessageId.js';

// TODO: Update this with the user's preference from config,
// or ask the user to create this store manually from their side,
// passing in the default locale and message if any (e.g. stored in LS).

function createLocale(defaultLocale = 'default', defaultMessages = {}) {
	const { subscribe, set } = writable(defaultLocale);

	// Necessary for plural to work; it expects a locale to be set.
	i18n.loadAndActivate({ locale: defaultLocale, messages: defaultMessages });

	return {
		subscribe,
		set: (locale, messages) => {
			i18n.loadAndActivate({ locale, messages });
			set(locale);
		}
	};
}
export const locale = createLocale();

/**
 *
 * @param {string | TemplateStringsArray | MessageDescriptor} descriptor - A tagged template literal, plain string, or a MessageDescriptor object.
 * @param {...string} args - additional arguments passed in to the tagged template literal, if any.
 * @returns {string} The message translated to the currently active locale.
 *
 */
const processTaggedLiteral = (descriptor, ...args) => {
	// For parsing plain strings marked by defineMessage (msg``)"
	if (typeof descriptor === 'string') {
		const id = generateMessageId(descriptor);
		return i18n.t({ id, message: descriptor });
	}

	if (typeof descriptor === 'object' && 'message' in descriptor) {
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

/**
 *
 * @param {number} num - The number value to be used for pluralization.
 * @param {Record<string, string>} variations - a list of message variations for each plural form based on the locale.
 * @returns {string} The message translated to the currently active locale.
 *
 */
const processPlural = (num, variations) => {
	const message = buildPluralMessages(variations);
	const id = generateMessageId(message);
	return i18n.t({ id, message, values: { num } });
};

/**
 * A Svelte store that subscribes to locale changes and returns a function that can be used to translate messages.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { t } from 'svelte-i18n-lingui';
 * </script>
 *
 * {$t`Hello World`}
 * ```
 */
export const t = derived(locale, () => processTaggedLiteral);

/**
 * A function that takes a message and returns a translated message based on the currently active locale.
 * Useful outside of Svelte components, as an alternative to accessing the store value with `get(t)`.
 *
 * Usage:
 * ```js
 * import { g } from 'svelte-i18n-lingui';
 *
 * const hello = g`Hello World`;
 * ```
 */
export const gt = processTaggedLiteral;

/**
 * A function that takes a message and returns it as is, while marking the message for extraction.
 * Useful for preparing messages to be translated at runtime based on the currently active locale.
 *
 * @param {TemplateStringsArray | MessageDescriptor} descriptor - A tagged template literal or a MessageDescriptor object.
 * @param {...string} args - additional arguments passed in to the tagged template literal, if any.
 * @returns {string} The message parsed by the tagged template literal function as a string.
 *
 * Usage:
 * ```js
 * import { msg } from 'svelte-i18n-lingui';
 *
 * const hello = msg`Hello World`;
 * ```
 */
export const msg = (descriptor, ...args) => {
	// If MessageDescriptor is passed, return it as is as the object is a valid descriptor for t or g.
	if (typeof descriptor === 'object' && 'message' in descriptor) {
		return descriptor;
	}
	// Otherwise, return the processed template literal as a string.
	return String.raw({ raw: descriptor }, ...args);
};

/**
 * A function that takes an object of message variations and returns it as is, while marking the collection for extraction.
 * Useful for preparing pluralization messages to be translated at runtime based on the currently active locale.
 * For msg definition, we don't need to supply the number value.
 *
 * @param {Record<string, string>} variations - a list of message variations for each plural form based on the locale.
 * @returns {Record<string, string>} The message collcetion as is.
 *
 * Usage:
 * ```js
 * import { msgPlural } from 'svelte-i18n-lingui';
 *
 * const hello = msgPlural({ one: '# item', other: '# items' });
 * ```
 */
export const msgPlural = (variations) => variations;

/**
 * A Svelte store that subscribes to locale changes and returns a function that can be used to translate pluralized messages.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { plural } from 'svelte-i18n-lingui';
 *
 *   const count = 2 + 3;
 * </script>
 *
 * {$plural(count, { one: '# item', other: '# items' })
 * ```
 */
export const plural = derived(locale, () => processPlural);
export const gPlural = processPlural;

export { default as T } from './T.svelte';
