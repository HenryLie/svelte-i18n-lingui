import { generateMessageId } from '../lib/generateMessageId.js';

// For the purpose of this test, message and context are combined in the catalog key separated by a pipe character.
function convertMessageCatalogToIdKeys(catalog) {
	const result = {};
	for (const [key, value] of Object.entries(catalog)) {
		const [message, context] = key.split('|');
		result[generateMessageId(message, context)] = value;
	}
	return result;
}

export const messageCatalog = convertMessageCatalogToIdKeys({
	hello: 'こんにちは',
	'hello {0}': 'こんにちは {0}',
	John: 'ジョン',
	'right|direction': '右',
	'right|correct': '正しい',
	'{num, plural, one {There is # item.} other {There are # items.}}':
		'{num, plural, one {# 個のアイテムがあります。} other {# 個のアイテムがあります。}}',
	'{num, plural, one {There is # item.} other {There are # items.}}|messages':
		'{num, plural, other {# 件があります。}}',
});
