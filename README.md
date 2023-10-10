# svelte-i18n-lingui

Use [Lingui](https://lingui.dev/) for adding i18n in Svelte/Sveltekit projects, with gettext-style message as catalog id.

## Features

- **Message as catalog id** - see your base language text in your code instead of a manually generated ID
- **Message extraction** - plain strings in the code consumed or marked by the library is automatically extracted into a catalog with a simple cli command
- **Shortened id for compiled catalog** - use a replacement short message hash instead of the original message in the compiled catalog to shave off the compiled catalog size.
- **Simple api with stores** - utilizes svelte stores to subscribe to locale changes and translate text in real time.
- **Clean syntax** - use tagged template literals for simple translations, e.g. `` $t`Hello world` ``

## How it works

Messages that should be translated to different languages need to be marked for extraction. There are two ways to do this:

- **Automatic:** when you use the provided store or function to translate the message during runtime, you are also marking that message for extraction.
- **Manual:** sometimes we want to define a message somewhere in the code (usually js/ts files) to be translated at a later time, since the user might update their preferred language on the fly. To accommodate this, a special function is provided to mark the messages for extraction.

## Installation

Firstly, install this package along with the Lingui packages.

```sh
npm install --save @lingui/core svelte-i18n-lingui
npm install --save-dev @lingui/cl
```

### Configure Lingui

After the packages are installed, create a `lingui.config.ts` (or js depending on your project config) and add a basic configuration as in this example:

```ts
import { jstsExtractor, svelteExtractor } from 'svelte-i18n-svelte/extractor';

export default config = {
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

Here we are using svelte-i18n-svelte's extractors to allow for extracting messages with customized tags from both svelte components and plain js/ts files.

### NPM Commands

To extract messages as catalogs and compile them for production, `@lingui/cli` provides cli commands that we can integrate to our project's workflow. Inside `package.json`, add these two commands:

```json
{
  scripts: {
    ...,
    "extract": "lingui extract",
    "compile": "lingui compile --typescript"
  }
}
```

These can be added to pre-commit hooks to make sure that new text are properly extracted and compiled.

## Usage

```
NOTE: Currently the library is set up with a fixed configuration:

- `en` language is the base language and activated automatically during startup
- This default catalog is loaded from `src/locales/en.ts`

These will be made flexible in future updates.
```

Importing the store for the first time will initiate Lingui's i18n instance with the default language and load its catalog for immediate usage.

### Change Active Locale

Locale can be changed by accessing the `set` method of the `locale` store:

```svelte
<script lang="ts">
	import { locale } from 'svelte-i18n-lingui';
</script>

<button on:click={() => locale.set('en')}>Switch to English</button>
<button on:click={() => locale.set('ja')}>Switch to Japanese</button>
```

### Basic Translations

To start translating in Svelte files, import the `t` store:

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

### Define Message

Since the extractor parses the code statically, messages must be plain string to be extractable. Template literals or variables names won't work.

```svelte
<script lang="ts">
	import { t } from 'svelte-i18n-lingui';

	const text = 'message';
</script>

{$t`${text}`}<!-- Will not work, extractor cannot find the message to extract -->
```

Instead, mark the string as extractable first with the `msg` function, and pass it in to the store later on as a plain string (not as tagged template literal)

```svelte
<script lang="ts">
	import { t, msg } from 'svelte-i18n-lingui';

	const text = msg`message`;
</script>

{$t(text)}
```

### Interpolating Elements/Components

To include components or elements in the middle of the message, use the component and use `#` to mark slots for insertion:`

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

We can also add a comment for the translators reading the message catalog, this won't affect the extraction or compilation result in any ay:

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

Refer to Lingui's [pluralization guide](https://lingui.dev/guides/plurals) for more information.

### Usage Outside of Svelte Components

Since Svelte's stores are meant to be used in Svelte components, using them inside plain js/ts files is a bit awkward since you need to use the `get` helper to subscribe, get the value, and the unsubscribe immediately. `svelte-i18n-lingui` provides another way to access Lingui's i18n through plain strings:

- `$t` => `gt`
- `$plural` => `gPlural`
