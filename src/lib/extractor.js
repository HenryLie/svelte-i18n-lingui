/**
 * @typedef {import("@lingui/conf").ExtractorType} ExtractorType
 */

import { preprocess, parse, walk } from 'svelte/compiler';
import sveltePreprocess from 'svelte-preprocess';
import { Parser } from 'acorn';
import { generateMessageId } from './generateMessageId.js';

/**
 * @type {ExtractorType}
 */
export const svelteExtractor = {
	match(filename) {
		return filename.endsWith('.svelte');
	},
	async extract(filename, source, onMessageExtracted, _ctx) {
		try {
			const { code: processedCode, map: _processedMap } = await preprocess(
				source,
				[sveltePreprocess()],
				{ filename }
			);

			const ast = parse(processedCode, { filename });

			walk(ast, {
				enter(node, _parent, _prop, _index) {
					if (node.type === 'TaggedTemplateExpression' && ['$t', 'msg'].includes(node.tag.name)) {
						const { start } = node.quasi.loc;
						const rawQuasis = node.quasi.quasis.map((q) => q.value.raw);
						let message = rawQuasis[0];
						rawQuasis.slice(1).forEach((q, i) => {
							message += `{${i}}${q}`;
						});
						onMessageExtracted({
							id: generateMessageId(message),
							message,
							context: undefined,
							comment: undefined,
							origin: [filename, start.line, start.column]
						});
					}
				}
			});
		} catch (err) {
			console.error(err);
		}
	}
};

/**
 * @type {ExtractorType}
 */
export const jstsExtractor = {
	match(filename) {
		return filename.endsWith('.js') || filename.endsWith('.ts');
	},
	async extract(filename, source, onMessageExtracted, _ctx) {
		try {
			const ast = Parser.parse(source, { filename, sourceType: 'module', ecmaVersion: 2020 });

			walk(ast, {
				enter(node, _parent, _prop, _index) {
					if (node.type === 'TaggedTemplateExpression' && ['g', 'msg'].includes(node.tag.name)) {
						const { start } = node.quasi;
						const rawQuasis = node.quasi.quasis.map((q) => q.value.raw);
						let message = rawQuasis[0];
						rawQuasis.slice(1).forEach((q, i) => {
							message += `{${i}}${q}`;
						});
						onMessageExtracted({
							id: generateMessageId(message),
							message,
							context: undefined,
							comment: undefined,
							origin: [filename, start.line, start.column]
						});
					}
				}
			});
		} catch (err) {
			console.error(err);
		}
	}
};
