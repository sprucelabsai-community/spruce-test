import BaseSpruceTest from './BaseSpruceTest'
import test from './decorators'
import assert from './assert'

interface ICustomObj {
	testStr: string
}

export default class AssertTest extends BaseSpruceTest {
	@test('can assert types')
	protected static async doesCallBeforeAll() {
		assert.expectType<string>('string')
		assert.expectType<number>(123)

		const myCustomObj: ICustomObj = {
			testStr: 'blah'
		}

		assert.expectType<ICustomObj>(myCustomObj)
	}

	@test('can handle async throws')
	protected static async canHandleAsyncThrows() {
		let hitError = false
		await assert.throws(
			async () =>
				new Promise(() => {
					hitError = true
					throw new Error('should catch')
				})
		)

		assert.isTrue(hitError)
	}

	@test('catches if no error thrown')
	protected static async canDetectNoErrorThrown() {
		let hitCallback = true
		let detectedNoThrow = false

		try {
			await assert.throws(async () => {
				hitCallback = true
			})
		} catch (err) {
			detectedNoThrow = true
			assert.isOk(err)
		}

		assert.isTrue(hitCallback)
		assert.isTrue(detectedNoThrow)
	}

	@test('matches error on string match')
	protected static async canMatchErrorByString() {
		await assert.throws(async () => {
			throw new Error('Match on string')
		}, 'on string')
	}

	@test('does not matches error on bad string match')
	protected static async doesNotMatchErrorByBadString() {
		let errorThrown = false
		try {
			await assert.throws(async () => {
				throw new Error('Match on string')
			}, 'on string2')
		} catch (err) {
			errorThrown = true
		}

		assert.isTrue(errorThrown)
	}

	@test('matches error on regex match')
	protected static async canMatchErrorByRegex() {
		await assert.throws(async () => {
			throw new Error('Match on string')
		}, /on STRING/i)
	}

	@test('does not matches error on bad regex match')
	protected static async doesNotMatchErrorByBadRegex() {
		let errorThrown = false
		try {
			await assert.throws(async () => {
				throw new Error('Match on string')
			}, /on string2/)
		} catch (err) {
			errorThrown = true
		}

		assert.isTrue(errorThrown)
	}

	@test('can handle non async errors')
	protected static async handlesNonAsync() {
		await assert.throws(() => {
			throw new Error('Match on string')
		}, /on string/)
	}

	@test('asserts is string (test will pass, types will fail)')
	protected static async assertIsString() {
		const path = ((): string | undefined => {
			return 'test'
		})()
		assert.isString(path)
		assert.expectType<string>(path)
	}
}
