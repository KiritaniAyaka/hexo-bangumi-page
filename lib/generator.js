const log = require('./logger')
const { BangumiRenderer } = require('./BangumiRenderer')

module.exports = {
	async generate(dir, config) {
		log.d(config)
		const renderer = new BangumiRenderer(dir, config)
		return renderer.render()
	},
}
