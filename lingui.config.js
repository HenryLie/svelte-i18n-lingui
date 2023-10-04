/**
 * @typedef {import("@lingui/conf").LinguiConfig} LinguiConfig
 */

import { formatter } from '@lingui/format-po';
import { jstsExtractor, svelteExtractor } from './src/lib/extractor.js';

/**
 * @type {LinguiConfig}
 */
const config = {
	locales: ['en', 'ja'],
	catalogs: [
		{
			path: 'src/locales/{locale}',
			include: ['src/lib', 'src/routes']
		}
	],
	format: formatter({ origins: false, explicitIdAsDefault: true }),
	extractors: [jstsExtractor, svelteExtractor]
};

export default config;
