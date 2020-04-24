import path from 'path'

/** Base test class chalk full of helpers to make testing more 🔥🔥🔥 */
export default class BaseTest {
	/** Override this method to execute code before all your tests */
	protected static async beforeAll() {}

	/** Override this method to execute code after all your tests */
	protected static async afterAll() {}

	/** Override this method to execute code before each of your tests run */
	protected static async beforeEach() {}

	/** Override this method to execute code after each of your tests run */
	protected static async afterEach() {}

	/** Resolve a local file relative to the test being run */
	protected static resolvePath(...filePath: string[]) {
		// Paths should be resolved relative to the test file vs the root of the project
		const cache = require('module')._cache
		const matchedModule = Object.keys(cache)
			.map(key => cache[key])
			.find(item => item?.exports === this || item?.exports?.default === this)

		const base = path.dirname(matchedModule.filename)
		let builtPath = path.join(...filePath)

		if (builtPath[0] !== '/') {
			// Relative to the cwd
			if (builtPath.substr(0, 2) === './') {
				builtPath = builtPath.substr(1)
			}

			builtPath = path.join(base, builtPath)
		}

		return builtPath
	}
	/** Hold for a sec  */
	protected static async wait(ms = 1000) {
		return new Promise(resolve => {
			setTimeout(() => resolve(), ms)
		})
	}
}
