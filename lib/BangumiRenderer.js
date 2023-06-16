const path = require('path')
const njk = require('nunjucks')
const _pagination = require('hexo-pagination')
const log = require('./logger')
const { readString, cache } = require('./util')

function pagination(base, posts, option) {
	// while `posts` is empty, the `pagination` will not return any page objects
	// should return an empty page object instead
	if (!posts || posts.length < 1) {
		return {
			path: `${base}/`,
			layout: ['page', 'post'],
			data: {
				base: `${base}/`,
				total: 1,
				current: 1,
				current_url: `${base}/`,
				posts: [],
				prev: 0,
				prev_link: '',
				next: 0,
				next_link: '',
				title: '追番',
				statusPage: `${option.data.statusPage}`,
			},
		}
	}
	return _pagination(base, posts, option)
}

const collectionType = [
	{
		name: '全部',
	},
	{
		name: '想看',
		path: '/want',
	},
	{
		name: '看过',
		path: '/watched',
	},
	{
		name: '在看',
		path: '/watching',
	},
	{
		name: '搁置',
		path: '/holding',
	},
	{
		name: '抛弃',
		path: '/dropped',
	},
]

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

/**
 * normalize a path as required by Hexo
 * @param {*} path path string
 * @returns normalized path
 */
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
		paginator: () => njk.compile(readString('../template/paginator.njk')),
		statusNav: () => njk.compile(readString('../template/status_nav.njk')),
	})

	/**
	 * make a config object for pagination
	 * @param {*} data data to combine
	 * @returns config object
	 */
	makePaginationConfig(data) {
		return {
		// if it is undefined, do not paginate
		// https://github.com/hexojs/hexo-pagination/blob/master/lib/pagination.js#L67-L73
			perPage: this.config.perPage,
			format: '%d',
			layout: ['page', 'post'],
			data: {
				title: '追番',
				...data,
			},
		}
	}

	/**
	 * render a page
	 * @param {*} page page data or undefined, if not provided, render from `bangumis`
	 * @returns rendered html
	 */
	renderBangumiPage(page) {
		let paginator
		let statusNav

		if (this.config.splitStatus) {
			statusNav = this.shared.statusNav.render({
				statuses: collectionType.filter(type => !!type.name).map((type) => {
					type.cur = page.data.statusPage === type.name
					return type
				}),
			})
		}

		// render bangumis
		const coverMode = parseCoverMode(this.config.cover)
		const bangumis = this.shared.template.render({
			data: page.data.posts.map((bangumi, index) => {
				const detail = findDetail(this.shared.details, bangumi.subject_id)
				return {
					id: index,
					img: detail.images[coverMode],
					originTitle: detail.name,
					title: detail.name_cn,
					status: collectionType[bangumi.type].name,
					summary: detail.summary,
					max: detail.eps,
					cur: bangumi.ep_status,
					progress:
						detail.eps === 0 ? 100 : (bangumi.ep_status / detail.eps) * 100,
					imgAlt: this.config.showImgAlt == null ? true : this.config.showImgAlt,
				}
			}),
		})

		// if pagination enabled
		if (page.data.total !== 1) {
			// render pagination
			paginator = this.shared.paginator.render({
				// origin attributes
				...Object.keys(page.data)
					.filter(k => k !== 'posts')
					.reduce((obj, cur) => {
						obj[cur] = page.data[cur]
						return obj
					}, {}),
				// util functions
				/**
				 * normalize a path to url relative path
				 * @param {*} path path string
				 * @returns normalized path
				 */
				normalizePath: (path) => {
					let p = path
					p = p.endsWith('/') ? p : `${p}/`
					p = p.startsWith('/') ? p : `/${p}`
					return p
				},
			})
		}

		return '<link rel="stylesheet" href="/css/bangumi.css" />' +
			`${statusNav ?? ''}` +
			`${bangumis}` +
			`${paginator ?? ''}`
	}

	/**
	 * render a page object or array to hexo object
	 * @param {*} page page object from pagination
	 * @returns rendered hexo page object
	 */
	renderPages(page) {
		if (Array.isArray(page)) {
			return [...page.map(p => this.renderPages(p))]
		}
		page.data.content = this.renderBangumiPage(page)
		page.path = normalizePagePath(page.path)
		return page
	}

	render() {
		if (this.config.splitStatus) {
			return this.renderPages([
				...pagination('bangumi', this.shared.bangumis, this.makePaginationConfig({ statusPage: '全部' })), // zenbu
				// pages split with status
				...collectionType
					.filter(type => !!type.name && type.path)
					.map((type, index) =>
						pagination(`bangumi${type.path}`,
							this.shared.bangumis.filter(bamgumi => bamgumi.type === index + 1),
							this.makePaginationConfig({ statusPage: type.name })),
					)
					.flat(1),
			])
		} else {
			return this.renderPages(pagination('bangumi', this.shared.bangumis, this.makePaginationConfig()))
		}
	}
}

module.exports = {
	BangumiRenderer,
}
