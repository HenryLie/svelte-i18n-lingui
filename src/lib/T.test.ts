import { it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import { messageCatalog } from '../helpers/test.js';

import T from './T.svelte';
import { locale } from '.';

it('When there are no translation catalog, show the message as-is', () => {
	render(T, { msg: 'hello' });
	expect(screen.getByText('hello')).toBeDefined();
});

it('When translation catalog is set, show the translated message', () => {
	locale.set('ja', messageCatalog);
	render(T, { msg: 'hello' });
	expect(screen.getByText('こんにちは')).toBeDefined();
});

it('Respects context and ignores comment when set', () => {
	render(T, { msg: 'right', ctx: 'direction' });
	expect(screen.getByText('右')).toBeDefined();
	cleanup();

	render(T, { msg: 'right', ctx: 'correct' });
	expect(screen.getByText('正しい')).toBeDefined();
	cleanup();

	render(T, { msg: 'right', ctx: 'correct', cmt: 'Comment for translator' });
	expect(screen.getByText('正しい')).toBeDefined();
});
