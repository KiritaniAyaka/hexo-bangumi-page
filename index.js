const fs = require('hexo-fs')
const fss = require('fs')
const log = require('hexo-log')({
	debug: false,
	silent: false
})

const axios = require('axios').default
const server = 'https://api.bgm.tv'
const version = '1.0'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36 HexoBangumiPage/' + version
const $ = axios.create({
	baseURL: server,
	headers: {
		'User-Agent': UA,
		'Accept-Language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
	}
})

hexo.extend.generator.register('bangumi', async function (locals) {
	const { generate } = require('./generator.js')
	return await generate(hexo.base_dir, hexo.config.bangumi)
});

hexo.extend.console.register('bangumi', 'Operate local bangumi data.', {
	options: [
		{ name: '-u, --update', desc: 'Update bangumi list.' },
		{ name: '-d, --detail', desc: 'Update bangumi detail data.' },
		{ name: '-c, --clean', desc: 'Clean bangumi detail cache.' },
	]
}, function (args) {
	if (args.c || args.clean) {
		try {
			fss.rmSync('./bangumi_detail.json')
		} catch (ignore) {
		}
		try {
			fss.rmSync('./bangumi.json')
		} catch (ignore) {
		}
		log.i('Clean finished.')
	}
	if (args.update || args.u) {
		const { user } = hexo.config.bangumi
		if (!user) {
			log.fatal('"bangumi.user" has not set.')
			return
		}
		updateBangumiData(user)
	}
	if (args.d || args.detail) {
		updateBangumiDetail()
	}
})

async function updateBangumiDetail() {
	let cache = [], bangumis
	try {
		bangumis = JSON.parse(fs.readFileSync('./bangumi.json'))
		log.i(`Start updating bangumi details. (${bangumis.length})`)
	} catch (err) {
		log.i('Cannot read bangumi list data, please update list data first.')
		return
	}
	try {
		cache = JSON.parse(fs.readFileSync('./bangumi_detail.json'))
		log.i(`Find detail caches. (${cache.length})`)
	} catch (ignored) {
	}
	let cacheIds = []
	for (const item of cache) {
		cacheIds.push(item.id)
	}
	for (const bangumi of bangumis) {
		if (cacheIds.indexOf(bangumi.subject_id) == -1) {
			log.i(`Updating... (${bangumi.subject_id})`)
			const detail = await getBangumiDetail(bangumi.subject_id)
			cache.push(detail)
			cacheIds.push(bangumi.subject_id)
			sleep(3000)
			continue
		}
	}
	fs.writeFileSync('./bangumi_detail.json', JSON.stringify(cache))
	log.i('Details updated.')
}

async function getBangumiDetail(id) {
	const { data } = await $.get(`/v0/subjects/${id}`)
	return data
}

async function updateBangumiData(user) {
	let data = []
	data = await getBangumiList(data, user, 0)
	fs.writeFileSync('./bangumi.json', JSON.stringify(data))
}

const numPerPage = 50

async function getBangumiList(arr, user, offset) {
	const { data: response } = await $.get(`/v0/users/${user}/collections?limit=${numPerPage}&offset=${offset}&subject_type=2`)
	const { data, total, limit } = response
	for (const item of data) {
		arr.push(item)
	}
	if (offset + limit >= total) {
		return arr
	}
	return getBangumiList(arr, user, offset + numPerPage)
}

function sleep(n) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
