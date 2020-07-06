import path from 'path'

export interface ITestPlugin {
	afterAll?: () => void
}

/** Base test class chalk full of helpers to make testing more 🔥🔥🔥 */
export default class AbstractSpruceTest {
	/** The current cwd */
	protected static cwd: string

	private static plugins: ITestPlugin[] = []

	/** Override this method to execute code before all your tests */
	protected static async beforeAll() {
		this.cwd = process.cwd()
	}

	/** Override this method to execute code after all your tests */
	protected static async afterAll() {
		this.plugins.forEach((plugin) => plugin.afterAll?.())
	}

	/** Override this method to execute code before each of your tests run */
	protected static async beforeEach() {}

	/** Override this method to execute code after each of your tests run */
	protected static async afterEach() {}

	/** Resolve a local file relative to the test being run */
	protected static resolvePath(...filePath: string[]) {
		const cwd = this.cwd
		let builtPath = path.join(...filePath)

		if (!cwd) {
			throw new Error('You must call super.beforeAll().')
		}

		if (builtPath[0] !== '/') {
			// Relative to the cwd
			if (builtPath.substr(0, 2) === './') {
				builtPath = builtPath.substr(1)
			}

			builtPath = path.join(cwd, builtPath)
		}

		return builtPath
	}

	/** Hold for a sec  */
	protected static async wait(ms = 1000) {
		return new Promise((resolve) => {
			setTimeout(() => resolve(true), ms)
		})
	}

	/** Plugins can listen in to all hooks and tests and do whatever else they need */
	protected static addPlugin(plugin: ITestPlugin) {
		this.plugins.push(plugin)
	}

	protected static async clearPlugins() {
		this.plugins = []
	}
}
