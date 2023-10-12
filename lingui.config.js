/**
 * @typedef {import("@lingui/conf").LinguiConfig} LinguiConfig
 */

import { jstsExtractor, svelteExtractor } from './src/lib/extractor.js';

/**
 * @type {LinguiConfig}
 */
const config = {
	locales: ['en', 'ja'],
	sourceLocale: 'en',
	catalogs: [
		{
			path: 'src/locales/{locale}',
			include: ['src/lib', 'src/routes', 'src/fixtures']
		}
	],
	extractors: [jstsExtractor, svelteExtractor]
};

export default config;
