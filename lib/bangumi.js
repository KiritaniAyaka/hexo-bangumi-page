const log = require('./logger')
const axios = require('./request')

module.exports = {
	getBangumiDetail,
	getBangumiList,
}

/**
 * get bangumi detail by id
 * @param {number} id
 * @returns data from bangumi api
 */
async function getBangumiDetail(id) {
	const { data } = await axios.get(`/v0/subjects/${id}`)
	return data
}

/**
 *
 * @param {number} user user id
 * @returns bangumi list data from bangumi api
 */
async function getBangumiList(user) {
	let data = []
	data = await getList(data, user, 0)
	return data
}

const numPerPage = 50

async function getList(arr, user, offset) {
	const { data: response } = await axios.get(
		`/v0/users/${user}/collections?limit=${numPerPage}&offset=${offset}&subject_type=2`,
	)
	const { data, total, limit } = response
	log.d(data, total, limit)
	arr.push(...data)
	if (offset + limit >= total) {
		return arr
	}
	return getList(arr, user, offset + numPerPage)
}
