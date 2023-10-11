import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { generateMessageId } from './generateMessageId.js';
import { locale, t, gt, gPlural, msg, msgPlural } from './index.js';

function convertMessageCatalogToIdKeys(catalog) {
	const result = {};
	for (const [key, value] of Object.entries(catalog)) {
		result[generateMessageId(key)] = value;
	}
	return result;
}

const messageCatalog = convertMessageCatalogToIdKeys({
	hello: 'こんにちは',
	'hello {0}': 'こんにちは {0}',
	John: 'ジョン'
});

describe('svelte-i18n-lingui', () => {
	afterEach(() => {
		locale.set('default');
	});

	describe('locale', () => {
		it('is initially set up with a default locale', () => {
			expect(get(locale)).toBe('default');
		});
		it('can be switched to a different locale', () => {
			locale.set('en');
			expect(get(locale)).toBe('en');
		});
	});

	describe('t', () => {
		it('returns the original message if no translation is available', () => {
			expect(get(t)`hello`).toBe('hello');
		});

		describe('with a message catalog', () => {
			beforeEach(() => {
				locale.set('ja', messageCatalog);
			});
			it('can translate messages declared by a tagged literal', () => {
				expect(get(t)`hello`).toBe('こんにちは');
			});
			it('can translate messages declared by a tagged literal with a variable', () => {
				const name = 'John';
				expect(get(t)`hello ${name}`).toBe('こんにちは John');
			});
			it('can translate messages declared by a tagged literal with a translated variable', () => {
				expect(get(t)`hello ${get(t)`John`}`).toBe('こんにちは ジョン');
			});
			it.todo('can translate messages in plain string, as returned my the msg function');
			it.todo('can translate messages in MessageDescriptor ');
			it.todo('can translate messages in MessageDescriptor with context ');
			it.todo('can translate messages in MessageDescriptor with comment ');
			it.todo('can translate messages in MessageDescriptor with both context and comment ');
		});
	});
});
