import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { locale, t, gt, msg, msgPlural, plural, gPlural } from './index.js';
import { messageCatalog } from '../helpers/test.js';

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

	describe.each([
		{ name: 't store', t: get(t) },
		{ name: 'gt', t: gt },
	])('$name', ({ t }) => {
		it('returns the original message if no translation is available', () => {
			expect(t`hello`).toBe('hello');
		});

		describe('with a message catalog', () => {
			beforeEach(() => {
				locale.set('ja', messageCatalog);
			});
			it('can translate messages declared by a tagged literal', () => {
				expect(t`hello`).toBe('こんにちは');
			});
			it('can translate messages declared by a tagged literal with a variable', () => {
				const name = 'John';
				expect(t`hello ${name}`).toBe('こんにちは John');
			});
			it('can translate messages declared by a tagged literal with a translated variable', () => {
				expect(t`hello ${t`John`}`).toBe('こんにちは ジョン');
			});
			it('can translate messages in plain string, as returned my the msg function', () => {
				const message = 'hello';
				expect(t(message)).toBe('こんにちは');
			});
			it('can translate messages in MessageDescriptor format', () => {
				expect(t({ message: 'hello' })).toBe('こんにちは');
			});
			it('can translate messages in MessageDescriptor with context', () => {
				expect(t({ message: 'right', context: 'direction' })).toBe('右');
				expect(t({ message: 'right', context: 'correct' })).toBe('正しい');
			});
			it('can translate messages in MessageDescriptor with both context and comment', () => {
				expect(
					t({ message: 'right', context: 'direction', comment: 'The direction, to the right.' }),
				).toBe('右');
				expect(
					t({
						message: 'right',
						context: 'correct',
						comment: "The word for correctness e.g. that's right",
					}),
				).toBe('正しい');
			});
		});
	});

	describe('msg', () => {
		it('returns the MessageDescriptor object as-is', () => {
			const descriptor = {
				message: 'This is the message.',
				context: 'This is the context.',
				comment: 'Comment for translator',
			};
			expect(msg(descriptor)).toBe(descriptor);
		});
		it('returns the parsed template literal as a string', () => {
			const message = `hello ${'John'}`;
			expect(msg(message)).toBe('hello John');
		});
	});

	describe('msgPlural', () => {
		it('returns the message variations object as-is', () => {
			const variations = {
				one: 'There is # item.',
				other: 'There are # items.',
			};
			expect(msgPlural(variations)).toBe(variations);
		});
	});

	describe.each([
		{ name: 'plural store', plural: get(plural) },
		{ name: 'gPlural', plural: gPlural },
	])('$name', ({ plural }) => {
		it('returns the original message if no translation is available', () => {
			expect(plural(2, { one: 'There is # item.', other: 'There are # items.' })).toBe(
				'There are 2 items.',
			);
			expect(plural(1, { one: 'There is # item.', other: 'There are # items.' })).toBe(
				'There is 1 item.',
			);
			expect(plural(0, { one: 'There is # item.', other: 'There are # items.' })).toBe(
				'There are 0 items.',
			);
			expect(plural(-1, { one: 'There is # item.', other: 'There are # items.' })).toBe(
				'There is -1 item.',
			);
		});

		describe('with a message catalog', () => {
			beforeEach(() => {
				locale.set('ja', messageCatalog);
			});

			it('returns the correct translated message based on the number passed in', () => {
				expect(plural(2, { one: 'There is # item.', other: 'There are # items.' })).toBe(
					'2 個のアイテムがあります。',
				);
				expect(plural(1, { one: 'There is # item.', other: 'There are # items.' })).toBe(
					'1 個のアイテムがあります。',
				);
				expect(plural(0, { one: 'There is # item.', other: 'There are # items.' })).toBe(
					'0 個のアイテムがあります。',
				);
				expect(plural(-1, { one: 'There is # item.', other: 'There are # items.' })).toBe(
					'-1 個のアイテムがあります。',
				);
			});

			it.todo('respects the message context and ignores comments', () => {
				expect(
					gt({
						message: plural(2, { one: 'There is # item.', other: 'There are # items.' }),
						context: 'messages',
					}),
				).toBe('2件があります。');
			});
		});
	});
});
