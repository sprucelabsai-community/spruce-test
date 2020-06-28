import AbstractSpruceTest from '../AbstractSpruceTest'
import assert from '../assert'
import test from '../decorators'

export default class PluginsTest extends AbstractSpruceTest {
	private static pluginAfterAllCalled = false
	private static expectedPluginAfterAllCalled = false

	protected static async afterAll() {
		super.afterAll()
		if (this.expectedPluginAfterAllCalled) {
			this.expectedPluginAfterAllCalled = false
			assert.isTrue(this.pluginAfterAllCalled)
		}
	}

	@test()
	protected static async hasAddPluginMethod() {
		assert.isFunction(this.addPlugin)
	}

	@test()
	protected static async acceptsPlugin() {
		this.addPlugin({
			afterAll() {}
		})
	}

	@test()
	protected static async afterAllWasCalled() {
		this.expectedPluginAfterAllCalled = true
		this.addPlugin({
			afterAll: () => {
				this.pluginAfterAllCalled = true
			}
		})
	}
}
