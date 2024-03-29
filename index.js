const less = require('less')
const { readString } = require('./lib/util')
const log = require('./lib/logger')

const { clearCache, updateBangumiList, updateBangumiDetail } = require('./lib')(
	hexo.config.bangumi,
)
const { generate } = require('./lib/generator.js')

hexo.extend.generator.register('bangumi', async () => {
	log.d('hexo-bangumi-page: generate')
	return await generate(hexo.base_dir, hexo.config.bangumi)
})

hexo.extend.generator.register('bangumi-css', _locals => ({
	path: 'css/bangumi.css',
	data: async () => {
		const { css: style } = await less.render(readString('../template/style.less'))
		return style
	},
}))

hexo.extend.console.register(
	'bangumi',
	'Operate local bangumi data.',
	{
		options: [
			{ name: '-u, --update', desc: 'Update bangumi list.' },
			{ name: '-d, --detail', desc: 'Update bangumi detail data.' },
			{ name: '-c, --clean', desc: 'Clean bangumi detail cache.' },
		],
	},
	async (args) => {
		log.d('args:', args)
		if (args.c || args.clean) {
			clearCache()
		}
		if (args.update || args.u) {
			await updateBangumiList()
		}
		if (args.d || args.detail) {
			await updateBangumiDetail()
		}
	},
)
