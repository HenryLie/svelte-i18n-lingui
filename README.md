# svelte-i18n-lingui

Use [Lingui](https://lingui.dev/) for adding i18n in Svelte/Sveltekit projects, with gettext-style message as catalog id.

## Features

- **Message as catalog id** - see your base language text in your code instead of a manually generated ID
- **Message extraction** - plain strings in the code consumed or marked by the library is automatically extracted into a catalog with a simple cli command
- **Shortened id for compiled catalog** - use a replacement short message hash instead of the original message in the compiled catalog to reduce the catalog size, and subsequently download size.
- **Simple api with stores** - utilizes svelte stores to subscribe to locale changes and translate text in real time.
- **Clean syntax** - use tagged template literals for simple translations, e.g. `` $t`Hello world` ``

## Motivations

I created this package since I couldn't find any svelte i18n library that allows me to add i18n with a gettext-style approach, which works by:

- Writing the base language text as-is in the codebase, and mark them for extraction.
- A cli command will scan the codebase and extract the marked messages as a message catalog, usually .po files.
- We add a translations to the po files for every supported locale.
- Run another cli command to compile the catalog files into highly optimized message dictionary to be loaded during runtime.
- Use the provided functions to translate the message during runtime, reacting to the user's language preference updates and updating the text on the UI in real time.

Most of the i18n libraries for Svelte works by manually defining the message catalog, adding a short descriptive key name manually, and then use the keys in the code. I think this comes with a few drawbacks:

- We can't see the real text in the codebase, only a short summary of it in the form of the keys. This makes the code feel detached from the rendered result.
- We need to decide on the key names by ourselves depending on the context, which adds an additional mental burden every time we add text.
- The manual name we pick for the key are created by us, so it can be inconsistent when there are many people working on the project unless there is a very strict naming rule enforced in the team.
- To keep the name descriptive for the text, we might need to pick a long key name, which adds to the catalog's file size that the users need to download.
- When we write the keys manually, it could be hard to track for duplicate keys defined more than once in the catalog. This is especially true when the messages are grouped based on the page where they are used.

While looking for i18n libraries that support this requirement, I found [Lingui](https://lingui.dev/) which seems to fit this need, and it supports usage in both React and plain JS. While the plain JS version seem to work, I found some drawback when implementing them to my Svelte projects:

- The plain syntax without macro usage is quite verbose.
- It provides a macro that work for JS files to make the syntax much more succinct, but it doesn't work with modern Svelte projects that uses Vite as the bundler, since both Vite and Sveltekit expects libraries in ESM format. Lingui's macro depends on `babel-plugin-macros` to work, which doesn't seem to work well with Vite.
- Svelte and Vite don't use Babel to transpile code, so even if `babel-plugin-macros` work we'll need to add an extra tool to do extra transpilation when compiling.
- Lingui doesn't come with an extractor for Svelte files yet.
- The i18n function provided is not reactive since it's just a plain js function.

Due to the above challenges, I decided to build this library to replicate Lingui's macro functionality on Svelte projects. The basic syntax looks similar to Lingui's macro version, but there are some changes added on top to make it reactive on Svelte. This library also comes with an extractor for both Svelte files and js/ts files to support its customized syntax.

## How it works

Messages that should be translated to different languages need to be marked for extraction. There are two ways to do this:

- **Automatic:** when you use the provided store or function to translate the message during runtime, you are also marking that message for extraction.
- **Manual:** sometimes we want to define a message somewhere in the code (usually js/ts files) to be translated at a later time, since the user might update their preferred language on the fly. To accommodate this, a special function is provided to mark the messages for extraction.

## Installation

Firstly, install this package along with the Lingui packages.

```sh
npm install --save @lingui/core svelte-i18n-lingui
npm install --save-dev @lingui/cli
```

### Configure Lingui

After the packages are installed, create a `lingui.config.ts` (or js depending on your project config) and add a basic configuration. An example of a simple project with English base language and Japanese localization:

```ts
import { jstsExtractor, svelteExtractor } from 'svelte-i18n-svelte/extractor';

export default {
	locales: ['en', 'ja'],
	sourceLocale: 'en',
	catalogs: [
		{
			path: 'src/locales/{locale}',
			include: ['src/lib', 'src/routes']
		}
	],
	extractors: [jstsExtractor, svelteExtractor]
};
```

Here we are using `svelte-i18n-svelte`'s extractors to allow for extracting messages with customized tags from both svelte components and plain js/ts files.

### NPM Commands

To extract messages as catalogs and compile them for production, `@lingui/cli` provides cli commands that we can integrate to our project's workflow. Inside `package.json`, add these two commands:

```json
{
	"scripts": {
		// Add these commands
		"extract": "lingui extract",
		"compile": "lingui compile --typescript"
	}
}
```

These can be added to pre-commit hooks to make sure that new text are properly extracted and compiled.

## Usage

Importing the store for the first time will initiate Lingui's i18n instance with a default language and an empty message catalog.

### Change the Active Locale

Locale can be changed by accessing the `set` method of the `locale` store, passing in the desired locale and message catalog. To make sure that only the necessary message catalog is downloaded, use dynamic import, e.g.:

```svelte
<script lang="ts">
	import { locale } from 'svelte-i18n-lingui';

	async function setLocale(lang) {
		const { messages } = await import(`../locales/${lang}.ts`);
		locale.set(lang, messages);
	}
</script>

<button on:click={() => setLocale('en')}>Switch to English</button>
<button on:click={() => setLocale('ja')}>Switch to Japanese</button>
```

### Basic Translations

To start translating in Svelte files, import the `t` store and auto-subscribe to it by prefixing with `$`:

```svelte
<script lang="ts">
	import { t } from 'svelte-i18n-lingui';
</script>

<!-- Use directly as text element -->
{$t`hello`}

<!-- Use as attribute or prop -->
<ComponentA propName={$t`hello`} />

<!-- Supports parameterized text, for cases where different language has different order -->
{$t`Proceed to ${$t`cart`}`}
```

### Predefine Message

Since the extractor does a static parse of the code, messages must be plain string to be extractable. Template literals or variables names won't work.

```svelte
<script lang="ts">
	import { t } from 'svelte-i18n-lingui';

	const text = 'message';
</script>

{$t`${text}`}<!-- !!!Will not work, extractor cannot find the message to extract!!! -->
```

Instead, mark the string as extractable first with the provided `msg` function, and pass it to the store later on as a plain string (not as tagged template literal)

```svelte
<script lang="ts">
	import { t, msg } from 'svelte-i18n-lingui';

	const text = msg`message`;
</script>

{$t(text)}
```

### Interpolate Elements/Components

To include components or elements in the middle of the message, use the provided `<T>` component and use `#` characters to add slots in the middle of the text to insert elements or components:

```svelte
<script lang="ts">
	import { T } from 'svelte-i18n-lingui/component';
</script>

<T msg="Click # for more information">
	<a href="/about">{$t`here`}</a>
</T>
```

### MessageDescriptor Format

Sometimes we'll need to add a context info for messages that are exactly the same in the base language, but has different meanings in different places (e.g. in English `right` can either refer to direction or correctness). We can add a context by passing a message descriptor instead of plain string or literal string:

```svelte
{$t({
	message: 'right',
	context: 'direction'
})}
```

The context will be added on top of the message in the catalog, both of them combined are treated as a unique key for the message. Therefore, the same message with a different context will be extracted as separate entries in the catalog and can have its own translations.

We can also add a comment for the translators reading the message catalog e.g. to let them know how the message is going to be used. This is added as a pure comment on the message catalog and won't affect how the message is extracted or compiled.

```svelte
{$t({
	message: 'text',
	context: 'message for translator'
})}
```

### Plurals

To provide different messages for text with numbers, use the provided `$plural` store:

```svelte
{$plural(count, {
	one: '# item',
	other: '# items'
})}
```

Refer to Lingui's [pluralization guide](https://lingui.dev/guides/plurals) for more information on what keys are accepted on different locales.

### Usage Outside of Svelte Components

Since Svelte's stores are meant to be used in Svelte components, using them inside plain js/ts files is a bit awkward since you need to use the `get` helper to subscribe, get the value, and then immediately unsubscribe afterwards. `svelte-i18n-lingui` provides another way to access Lingui's i18n object through plain strings:

- `$t` => `gt`
- `$plural` => `gPlural`

## Contributing

Found a bug? Feel free to open an issue or PR to fix it!
