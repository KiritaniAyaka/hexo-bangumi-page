const njk = require('nunjucks')
const path = require('path')
const fs = require('fs')
const less = require('less')
const log = require('./logger')

const collectionType = ['', '想看', '看过', '在看', '搁置', '抛弃']

module.exports = {
	async generate(dir, config) {
		log.d(config)
		const bangumis = require(path.join(dir, './bangumi.json'))
		const details = require(path.join(dir, './bangumi_detail.json'))
		let result = ''
		let template = njk.compile(readString('../template/template.njk'))
		let i = 1
		for (const bangumi of bangumis) {
			const detail = findDetail(details, bangumi.subject_id)
			result += template.render({
				id: i,
				img: detail.images.large,
				originTitle: detail.name,
				title: detail.name_cn,
				status: collectionType[bangumi.type],
				summary: detail.summary,
				max: detail.eps,
				cur: bangumi.ep_status,
				progress:
					detail.eps == 0 ? 100 : (bangumi.ep_status / detail.eps) * 100,
				imgAlt: config.showImgAlt == null ? true : config.showImgAlt,
			})
			i++
		}
		return await generatorData(result)
	},
}

async function generatorData(data) {
	const { css: style } = await less.render(readString('../template/style.less'))
	log.d(style)
	const content = `<style>${style}</style><div class="bangumi-list">${data}</div>`
	return {
		path: 'bangumi/',
		data: {
			title: '追番',
			content,
		},
		layout: ['page', 'post'],
	}
}

function findDetail(details, id) {
	for (const detail of details) {
		if (detail.id == id) {
			return detail
		}
	}
	log.e('Cannot find bangumi detail of ' + id)
}

function readString(name) {
	return fs.readFileSync(path.join(__dirname, name)).toString()
}
