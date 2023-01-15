/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				body: ['IBM Plex Sans', 'serif'],
				mona: ['Mona Sans']
			}
		}
	},
	plugins: []
};
