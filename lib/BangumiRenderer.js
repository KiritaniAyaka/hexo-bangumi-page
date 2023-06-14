const path = require('path')
const njk = require('nunjucks')
const pagination = require('hexo-pagination')
const log = require('./logger')
const { readString, cache } = require('./util')

const collectionType = ['', '想看', '看过', '在看', '搁置', '抛弃']

function findDetail(details, id) {
	for (const detail of details) {
		if (detail.id === id) {
			return detail
		}
	}
	log.e(`Cannot find bangumi detail of ${id}`)
}

function parseCoverMode(coverMode) {
	const defaultMode = 'large'
	const coverModeStr = ['grid', 'small', 'common', 'medium', 'large']
	if (coverMode === null || coverMode === undefined) {
		return defaultMode
	}
	if (typeof coverMode === 'number') {
		return parseCoverMode(coverModeStr[coverMode.toFixed(0)])
	}
	if (typeof coverMode === 'string' && coverModeStr.includes(coverMode)) {
		return coverMode
	}
	log.e(`Config 'bangumi.cover': ${coverMode} is invalid\n\tshould be one of these values: ${coverModeStr}.\n\tusing default value: ${defaultMode}`)
	return defaultMode
}

function normalizePagePath(path) {
	let p = path
	p = p.startsWith('/') ? p.substring(1) : p
	p = p.endsWith('/') ? p : `${p}/`
	p = p.endsWith('index.html') ? p : `${p}index.html`
	return p
}

class BangumiRenderer {
	/**
	 * @param {*} dir hexo.base_dir
	 * @param {*} config config object
	 */
	constructor(dir, config) {
		this.dir = dir
		this.config = config
	}

	shared = cache({}, {
		bangumis: () => require(path.join(this.dir, './bangumi.json')),
		details: () => require(path.join(this.dir, './bangumi_detail.json')),
		template: () => njk.compile(readString('../template/template.njk')),
		navigator: () => njk.compile(readString('../template/navigator.njk')),
	})

	/**
	 * render a single bangumi element
	 * @param {*} bangumi bangumi data
	 * @param {number} i bangumi index in the page
	 * @returns {string} rendered html
	 */
	renderSingleBangumi(bangumi, i) {
		const coverMode = parseCoverMode(this.config.cover)
		const detail = findDetail(this.shared.details, bangumi.subject_id)
		return this.shared.template.render({
			id: i,
			img: detail.images[coverMode],
			originTitle: detail.name,
			title: detail.name_cn,
			status: collectionType[bangumi.type],
			summary: detail.summary,
			max: detail.eps,
			cur: bangumi.ep_status,
			progress:
				detail.eps === 0 ? 100 : (bangumi.ep_status / detail.eps) * 100,
			imgAlt: this.config.showImgAlt == null ? true : this.config.showImgAlt,
		})
	}

	/**
	 * render a page
	 * @param {*} page page data or undefined, if not provided, render from `bangumis`
	 * @returns rendered html
	 */
	renderBangumiPage(page) {
		let result = ''
		let navigator
		let statusNav

		// render bangumis
		page.data.posts.forEach((bangumi, index) => {
			result += this.renderSingleBangumi(bangumi, index)
		})

		// if pagination enabled
		if (page.data.total !== 1) {
			// render pagination
			navigator = this.shared.navigator.render(
				Object.keys(page.data).filter(k => k !== 'posts').reduce((obj, cur) => {
					obj[cur] = page.data[cur]
					return obj
				}, {}),
			)
		}

		return '<link rel="stylesheet" href="/css/bangumi.css" />' +
			`<div class="bangumi-list">${result}</div>` +
			`${navigator ?? ''}`
	}

	render() {
		const pages = pagination('bangumi', this.shared.bangumis, {
			// if it is undefined, do not paginate
			// https://github.com/hexojs/hexo-pagination/blob/master/lib/pagination.js#L67-L73
			perPage: this.config.perPage,
			format: '%d',
			layout: ['page', 'post'],
			data: {
				title: '追番',
			},
		})
		pages.forEach((page) => {
			page.data.content = this.renderBangumiPage(page)
			page.path = normalizePagePath(page.path)
		})
		return pages
	}
}

module.exports = {
	BangumiRenderer,
}