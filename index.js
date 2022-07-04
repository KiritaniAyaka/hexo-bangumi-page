const log = require('./lib/logger')

const { clearCache, updateBangumiList, updateBangumiDetail } = require('./lib')(
	hexo.config.bangumi,
)
const { generate } = require('./lib/generator.js')

hexo.extend.generator.register('bangumi', async function () {
	log.d('hexo-bangumi-page: generate')
	return await generate(hexo.base_dir, hexo.config.bangumi)
})

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
	async function (args) {
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
