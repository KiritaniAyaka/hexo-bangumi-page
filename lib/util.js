const fs = require('fs')
const path = require('path')

module.exports = {
	readString(name) {
		return fs.readFileSync(path.join(__dirname, name)).toString()
	},
	cache(obj, getters) {
		const getterNames = Object.keys(getters)
		for (const name of getterNames) {
			let cache
			Object.defineProperty(obj, name, {
				get: () => {
					if (!cache) {
						cache = getters[name]()
					}
					return cache
				},
			})
		}
		return obj
	},
}
