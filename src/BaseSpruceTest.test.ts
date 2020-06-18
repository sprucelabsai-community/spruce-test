import BaseSpruceTest from './BaseSpruceTest'
import test from './decorators'
import assert from './assert'
import faker from './faker'
import { ISpruce } from './Spruce'

let isBeforeAllCalled = false

let beforeEachCount = 0
let afterEachCount = 0

export default class BaseTestTest extends BaseSpruceTest {
	public static staticallyAvailable = true

	public static async beforeAll() {
		isBeforeAllCalled = true
	}

	public static async beforeEach() {
		beforeEachCount += 1
	}

	public static async afterEach() {
		afterEachCount += 1
	}

	@test('calls beforeAll')
	protected static async doesCallBeforeAll() {
		assert.isTrue(isBeforeAllCalled)
	}

	@test('can access Spruce IoC container')
	protected static async canAccessSpruce(spruce: ISpruce) {
		assert.isOk(spruce, 'Failed to load Spruce')
		assert.isOk(spruce.mercury, 'Mercury missing from Spruce')
	}

	@test('should pass basic asserts')
	protected static async shouldPass() {
		assert.isTrue(true)
		assert.isFalse(false)
		assert.equal(5, 5, `Thing's don't equal`)
	}

	@test('can pass variables to test handler from decorator', 'hello', 'world')
	protected static async canAccessVarsFromDecorator(
		spruce: ISpruce,
		hello: string,
		world: string
	) {
		assert.equal(hello, 'hello')
		assert.equal(world, 'world')
	}

	@test('called beforeEach and afterEach')
	protected static async calledEach() {
		assert.equal(beforeEachCount, 5)
		assert.equal(afterEachCount, 4)
	}

	@test('can create fake data')
	protected static async fakeData() {
		assert.isString(faker.name.firstName())
	}

	@test.todo('can create a TODO test')
	protected static async todo() {
		// TODO
	}
}
