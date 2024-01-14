export async function load(params) {
	const acceptLanguage = params.request.headers.get('accept-language');
	const firstMatch = acceptLanguage
		.split(',')
		.find((lang) => lang.includes('ja') || lang.includes('en'));

	return {
		lang: firstMatch.includes('ja') ? 'ja' : 'en'
	};
}
