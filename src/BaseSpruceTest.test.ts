import BaseSpruceTest from './BaseSpruceTest'
import test from './decorators'
import assert from './assert'
import faker from './faker'

let isBeforeAllCalled = false

let beforeEachCount = 0
let afterEachCount = 0

export default class BaseTestTest extends BaseSpruceTest {
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

	@test('calls beforeAll')
	protected static async doesCallBeforeAll() {
		assert.isTrue(isBeforeAllCalled)
	}

	@test('should pass basic asserts')
	protected static async shouldPass() {
		assert.isTrue(true)
		assert.isFalse(false)
		assert.equal(5, 5, `Thing's don't equal`)
	}

	@test('can pass variables to test handler from decorator', 'hello', 'world')
	protected static async canAccessVarsFromDecorator(
		hello: string,
		world: string
	) {
		assert.equal(hello, 'hello')
		assert.equal(world, 'world')
	}

	@test('called beforeEach and afterEach')
	protected static async calledEach() {
		assert.equal(beforeEachCount, 4)
		assert.equal(afterEachCount, 3)
	}

	@test('can create fake data')
	protected static async fakeData() {
		assert.isString(faker.name.firstName())
	}

	@test('has lock')
	protected static async lockExists() {
		assert.isFunction(BaseSpruceTest.lock)
	}

	@test('has unlock')
	protected static async unlockExists() {
		assert.isFunction(BaseSpruceTest.unlock)
	}

	@test('test does not lock first time')
	protected static async testLocking() {
		assert.isFalse(BaseSpruceTest.isLocked('t1'))
		await BaseSpruceTest.lock('t1')
		assert.isTrue(BaseSpruceTest.isLocked('t1'))
	}

	@test('test lock/unlock locks a thing')
	protected static async testLockUnlock() {
		let wasUnlockHit = false
		setTimeout(() => {
			assert.isTrue(BaseSpruceTest.isLocked('t2'))
			wasUnlockHit = true
			BaseSpruceTest.unlock('t2')
		}, 250)

		assert.isFalse(BaseSpruceTest.isLocked('t2'))
		await BaseSpruceTest.lock('t2')
		assert.isTrue(BaseSpruceTest.isLocked('t2'))
		// this lock MUST wait for unlock above
		await BaseSpruceTest.lock('t2')
		assert.isFalse(BaseSpruceTest.isLocked('t2'))
		assert.isTrue(wasUnlockHit)
	}

	@test('test unlock multiple times')
	protected static async testLockUnlockUnlock() {
		let wasUnlockHit = false
		setTimeout(() => {
			assert.isTrue(BaseSpruceTest.isLocked('t3'))
			wasUnlockHit = true
			BaseSpruceTest.unlock('t3')
			BaseSpruceTest.unlock('t3')
		}, 250)

		assert.isFalse(BaseSpruceTest.isLocked('t3'))
		await BaseSpruceTest.lock('t3')
		assert.isTrue(BaseSpruceTest.isLocked('t3'))
		// this lock MUST wait for unlock above
		await BaseSpruceTest.lock('t3')
		assert.isFalse(BaseSpruceTest.isLocked('t3'))
		assert.isTrue(wasUnlockHit)
	}

	@test('locks should not mix')
	protected static async testLocksDoNotMix() {
		assert.isFalse(BaseSpruceTest.isLocked('b1'))

		await BaseSpruceTest.lock('b2')

		assert.isFalse(BaseSpruceTest.isLocked('b1'))
		assert.isTrue(BaseSpruceTest.isLocked('b2'))

		await BaseSpruceTest.lock('b1')
		BaseSpruceTest.unlock('b2')

		assert.isTrue(BaseSpruceTest.isLocked('b1'))
		assert.isFalse(BaseSpruceTest.isLocked('b2'))
	}

	@test.todo('can create a TODO test')
	protected static async todo() {
		// TODO
	}
}
