module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es2021: true,
		node: true,
	},
	extends: 'eslint:recommended',
	parserOptions: {
		ecmaVersion: 'latest',
	},
	rules: {
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'windows'],
		quotes: ['error', 'single'],
		semi: ['error', 'never'],
		'no-var': 'error',
		'comma-style': ['error', 'last'],
		'no-unused-vars': 'warn',
	},
	globals: {
		hexo: true,
	},
}
