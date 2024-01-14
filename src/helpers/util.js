import { locale } from '$lib';

export async function setLocale(lang) {
	const { messages } = await import(`../locales/${lang}.ts`);
	locale.set(lang, messages);
}
