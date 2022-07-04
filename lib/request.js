const axios = require('axios').default

const server = 'https://api.bgm.tv'
const version = '1.0'
const UA = `KiritaniAyaka/hexo-bangumi-page/${version} (https://github.com/KiritaniAyaka/hexo-bangumi-page)`

const instance = axios.create({
	baseURL: server,
	headers: {
		'User-Agent': UA,
		'Accept-Language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
	}
})

module.exports = instance
