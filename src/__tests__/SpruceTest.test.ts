import AbstractSpruceTest from '../AbstractSpruceTest'
import test from '../decorators'
import assert from '../assert'

let isBeforeAllCalled = false

let beforeEachCount = 0
let afterEachCount = 0

export default class SpruceTest extends AbstractSpruceTest {
	protected static didSerial1Start = false
	protected static didSerial1Finish = false
	protected static didSerial2Finish = false
	protected static didSerial2Start = false

	protected static async beforeAll() {
		isBeforeAllCalled = true
	}

	protected static async beforeEach() {
		beforeEachCount += 1
	}

	protected static async afterEach() {
		afterEachCount += 1
	}

	@test()
	protected static async doesCallBeforeAll() {
		assert.isTrue(isBeforeAllCalled)
	}

	@test()
	protected static async basicPassingTest() {
		assert.isTrue(true)
		assert.isFalse(false)
		assert.isEqual(5, 5, `Thing's don't equal`)
	}

	@test('can pass variables to test handler from decorator', 'hello', 'world')
	protected static async canAccessVarsFromDecorator(
		hello: string,
		world: string
	) {
		assert.isEqual(hello, 'hello')
		assert.isEqual(world, 'world')
	}

	@test()
	protected static async calledBeforeAndAfterEach() {
		assert.isEqual(beforeEachCount, 4)
		assert.isEqual(afterEachCount, 3)
	}

	@test()
	protected static async asyncDebuggerWaits() {
		console.log('before')
		const results = await this.wait(1000)
		assert.isTrue(results)
	}

	@test.todo('can create a TODO test')
	protected static async todo() {
		// TODO
	}
}
