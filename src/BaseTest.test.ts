import AbstractTest, { ISpruce } from './BaseTest'
import test from './decorators'

/** Context just for this test */
interface IContext {
	hello: string
}

export default class BaseTestTest extends AbstractTest {
	protected static beforeEach(spruce: ISpruce<IContext>) {
		// Test setting something to the context
		spruce.context.hello = 'world'
	}

	@test('can access context')
	protected static async canAccessContext(spruce: ISpruce<IContext>) {
		spruce.is(spruce.context.hello, 'world', 'Setting context failed')
	}

	@test('should pass basic asserts')
	protected static async shouldPass(spruce: ISpruce<IContext>) {
		spruce.true(true)
		spruce.false(false)
		spruce.is(5, 5, `Thing's don't equal`)
	}
}
