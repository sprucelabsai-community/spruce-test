import BaseTest from './BaseTest'
import test from './decorators'
import { ExecutionContext } from 'ava'
import { ISpruce } from './Spruce'

/** Context just for this test */
interface IContext {
	hello: string
}

export default class BaseTestTest extends BaseTest {
	protected static beforeEach(t: ExecutionContext<IContext>) {
		// Test setting something to the context
		t.context.hello = 'world'
	}

	@test('can access Spruce IoC container')
	protected static async canAccessSpruce(
		t: ExecutionContext<IContext>,
		spruce: ISpruce
	) {
		t.assert(spruce, 'Failed to load Spruce')
		t.assert(spruce.mercury, 'Mercury missing from Spruce')
	}

	@test('can access context on assertion object')
	protected static async canAccessContext(t: ExecutionContext<IContext>) {
		t.is(t.context.hello, 'world', 'Setting context failed')
	}

	@test('should pass basic asserts')
	protected static async shouldPass(t: ExecutionContext<IContext>) {
		t.true(true)
		t.false(false)
		t.is(5, 5, `Thing's don't equal`)
	}

	@test('can pass variables to test handler from decorator', 'hello', 'world')
	protected static async canAccessVarsFromDecorator(
		t: ExecutionContext<IContext>,
		spruce: ISpruce,
		hello: string,
		world: string
	) {
		t.is(hello, 'hello')
		t.is(world, 'world')
	}
}
