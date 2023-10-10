/** @typedef {{ match(filename: string) => boolean, extract(filename: string, code: string, onMessageExtracted: (msg: ExtractedMessage) => void, ctx?: ExtractorCtx)=> Promise<void> | void }} ExtractorType */

// import fs from 'fs';
import { preprocess, parse, walk } from 'svelte/compiler';
import sveltePreprocess from 'svelte-preprocess';
import { Parser as Acorn } from 'acorn';
import { generateMessageId } from './generateMessageId.js';

const extractFromTaggedTemplate = (node, filename, onMessageExtracted) => {
	// `node.quasi.loc` is for extraction from svelte files, and `node.quasi` is for extraction from js/ts files
	const { start } = node.quasi.loc;
	const rawQuasis = node.quasi.quasis.map((q) => q.value.raw);
	let message = rawQuasis[0];
	rawQuasis.slice(1).forEach((q, i) => {
		message += `{${i}}${q}`;
	});
	onMessageExtracted({
		id: generateMessageId(message),
		message,
		origin: [filename, start.line, start.column]
	});
};

const extractFromCallExpression = (node, filename, onMessageExtracted) => {
	const { start } = node.loc;
	const { properties } = node.arguments[0];
	const messageProperty = properties.find((p) => p.key.name === 'message');
	if (messageProperty === undefined) {
		throw new Error('MessageDescriptor should contain a message property');
	}
	const message = messageProperty.value.value;
	// Only extract if message is a string literal, otherwise skip the node as it's not a valid MessageDescriptor
	if (message) {
		const context = properties.find((p) => p.key.name === 'context')?.value.value;
		const comment = properties.find((p) => p.key.name === 'comment')?.value.value;

		onMessageExtracted({
			id: generateMessageId(message, context),
			message,
			context,
			comment,
			origin: [filename, start.line, start.column]
		});
	}
};

const extractTags = (tags, node, filename, onMessageExtracted) => {
	if (node.type === 'TaggedTemplateExpression' && tags.includes(node.tag.name)) {
		extractFromTaggedTemplate(node, filename, onMessageExtracted);
	} else if (
		node.type === 'CallExpression' &&
		tags.includes(node.callee.name) &&
		node.arguments[0].type === 'ObjectExpression'
	) {
		extractFromCallExpression(node, filename, onMessageExtracted);
	}
};

const extractPlurals = (tags, node, filename, onMessageExtracted) => {
	if (
		node.type === 'CallExpression' &&
		tags.includes(node.callee.name) &&
		node.arguments[1].type === 'ObjectExpression'
	) {
		const { start } = node.loc;
		const { properties } = node.arguments[1];

		const message = `{num, plural, ${properties
			// key will use the "name" property for normal properties, and "value" property for exact matches
			.map((p) => `${p.key.name ?? p.key.value} {${p.value.value}}`)
			.join(' ')}}`;

		onMessageExtracted({
			id: generateMessageId(message),
			message,
			origin: [filename, start.line, start.column]
			// The actual number's value doesn't matter when extracting so we don't have to supply it
		});
	}
};

const extractPluralMessages = (tags, node, filename, onMessageExtracted) => {
	if (
		node.type === 'CallExpression' &&
		tags.includes(node.callee.name) &&
		node.arguments[0].type === 'ObjectExpression'
	) {
		const { start } = node.loc;
		const { properties } = node.arguments[0];

		const message = `{num, plural, ${properties
			// key will use the "name" property for normal properties, and "value" property for exact matches
			.map((p) => `${p.key.name ?? p.key.value} {${p.value.value}}`)
			.join(' ')}}`;

		onMessageExtracted({
			id: generateMessageId(message),
			message,
			origin: [filename, start.line, start.column]
		});
	}
};

const extractComponent = (node, filename, onMessageExtracted) => {
	if (node.type === 'InlineComponent' && node.name === 'T') {
		const { start } = node; // FIXME: Find out why Loc is not printed here, causing this to be incorrect
		const { attributes } = node;
		const message = attributes.find((a) => a.name === 'msg')?.value[0].data;
		const context = attributes.find((a) => a.name === 'ctx')?.value[0].data;
		const comment = attributes.find((a) => a.name === 'cmt')?.value[0].data;

		onMessageExtracted({
			id: generateMessageId(message, context),
			message,
			context,
			comment,
			origin: [filename, start.line, start.column]
		});
	}
};

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

			// fs.writeFileSync('ast.json', JSON.stringify(ast, null, 2));

			walk(ast, {
				enter(node, _parent, _prop, _index) {
					extractTags(['$t', 'msg'], node, filename, onMessageExtracted);
					extractPlurals(['$plural'], node, filename, onMessageExtracted);
					extractPluralMessages(['msgPlural'], node, filename, onMessageExtracted);
					extractComponent(node, filename, onMessageExtracted);
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
			const ast = Acorn.parse(source, {
				filename,
				sourceType: 'module',
				ecmaVersion: 2020,
				locations: true
			});

			// fs.writeFileSync('ast.json', JSON.stringify(ast, null, 2));

			walk(ast, {
				enter(node, _parent, _prop, _index) {
					extractTags(['gt', 'msg'], node, filename, onMessageExtracted);
					extractPlurals(['gPlural'], node, filename, onMessageExtracted);
					extractPluralMessages(['msgPlural'], node, filename, onMessageExtracted);
				}
			});
		} catch (err) {
			console.error(err);
		}
	}
};
