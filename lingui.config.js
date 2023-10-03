/**
 * @typedef {import("@lingui/conf").LinguiConfig} LinguiConfig
 */

import { formatter } from '@lingui/format-po';
import { extractor as defaultExtractor } from '@lingui/cli/api';
import { svelteExtractor } from './src/lib/extractor.js';

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
	// TODO: Add extractor for custom tagged template literals in js/ts files
	extractors: [defaultExtractor, svelteExtractor]
};

export default config;
