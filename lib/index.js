const fs = require('fs')
const log = require('./logger')
const { getBangumiList, getBangumiDetail } = require('./bangumi')

module.exports = config => {
	return {
		clearCache() {
			try {
				fs.rmSync('./bangumi_detail.json')
			} catch (e) {
				log.d(e)
			}
			try {
				fs.rmSync('./bangumi.json')
			} catch (e) {
				log.d(e)
			}
			log.i('Clean finished.')
		},

		async updateBangumiList() {
			const { user } = config
			log.d(user)
			if (!user) {
				log.fatal('"bangumi.user" has not set.')
				return
			}
			writeJSON('./bangumi.json', await getBangumiList(user))
		},

		async updateBangumiDetail() {
			let cache = []
			let bangumis
			try {
				bangumis = readJSON('./bangumi.json')
				log.i(`Start updating bangumi details. (${bangumis.length})`)
			} catch (err) {
				log.i('Cannot read bangumi list data, please update list data first.')
				return
			}
			try {
				cache = readJSON('./bangumi_detail.json')
				log.i(`Detail caches found: (${cache.length})`)
			} catch (e) {
				log.d('Cache not found')
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
					sleep()
					continue
				}
			}
			writeJSON('./bangumi_detail.json', cache)
			log.i('Details updated.')
		},
	}

	function writeJSON(path, obj) {
		fs.writeFileSync(path, JSON.stringify(obj, null, '	'))
	}

	function readJSON(path) {
		return JSON.parse(fs.readFileSync(path))
	}

	function sleep() {
		Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
	}
}
