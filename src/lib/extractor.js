/**
 * @typedef {import("@lingui/conf").ExtractorType} ExtractorType
 */

import { preprocess, parse, walk } from 'svelte/compiler';
import sveltePreprocess from 'svelte-preprocess';

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
					if (node.type === 'TaggedTemplateExpression' && node.tag.name === '$t') {
						const { start } = node.quasi.loc;
						const rawQuasis = node.quasi.quasis.map((q) => q.value.raw);
						let message = rawQuasis[0];
						rawQuasis.slice(1).forEach((q, i) => {
							message += `{${i}}${q}`;
						});
						console.log(message);
						onMessageExtracted({
							id: message,
							message: message,
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
