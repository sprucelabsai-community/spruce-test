import BaseTest from './BaseTest'
import test from './decorators'
import { ExecutionContext } from 'ava'

/** Context just for this test */
interface IContext {
	hello: string
}

export default class BaseTestTest extends BaseTest {
	protected static beforeEach(t: ExecutionContext<IContext>) {
		// Test setting something to the context
		t.context.hello = 'world'
	}

	@test('can access context as manager')
	protected static async canAccessContext(t: ExecutionContext<IContext>) {
		t.is(t.context.hello, 'world', 'Setting context failed')
	}

	@test('should pass basic asserts')
	protected static async shouldPass(t: ExecutionContext<IContext>) {
		t.true(true)
		t.false(false)
		t.is(5, 5, `Thing's don't equal`)
	}
}
