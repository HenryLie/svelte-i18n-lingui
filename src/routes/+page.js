import { msg } from '$lib/store.js';

const msgText = msg`defineMessage text`;

export async function load() {
	return {
		msgText
	};
}
