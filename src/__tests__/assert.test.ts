import AbstractSpruceTest from '../AbstractSpruceTest'
import test from '../decorators'
import assert from '../assert'

interface ICustomObj {
	testStr: string
}

export default class AssertTest extends AbstractSpruceTest {
	@test('can assert types')
	protected static async doesCallBeforeAll() {
		assert.isType<string>('string')
		assert.isType<number>(123)

		const myCustomObj: ICustomObj = {
			testStr: 'blah'
		}

		assert.isType<ICustomObj>(myCustomObj)
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

	@test()
	protected static async throwMatchesErrorByRegex() {
		await assert.throws(async () => {
			throw new Error('Match on string')
		}, /on STRING/i)
	}

	@test()
	protected static async throwReturnsTheError() {
		const err = await assert.throws(async () => {
			throw new Error('Match on string')
		})

		assert.isEqual(err.message, 'Match on string')
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
		assert.isType<string>(path)
	}

	@test(
		'include uses partial and matches simple',
		{ hello: 'world', taco: 'bell' },
		{ taco: 'bell' }
	)
	@test(
		'include uses partial and matches deep',
		{ hello: 'world', taco: 'bell', flavor: { cheese: true } },
		{ taco: 'bell' }
	)
	protected static includeTests(haystack: any, needle: any) {
		assert.include(haystack, needle)
	}

	@test('test that include types well with partial')
	protected static includeTestsObjectLiteral() {
		assert.include({ cheesy: 'burrito', hello: 'world' }, { cheesy: 'burrito' })
		assert.include('hello world', 'hello')
	}

	@test('test that includeDeep types well with partial')
	protected static includeDeepTestsObjectLiteral() {
		assert.deepNestedInclude(
			{ cheesy: 'burrito', hello: 'world', sub: { bar: 'foo' } },
			{ 'sub.bar': 'foo' }
		)
	}

	@test()
	protected static hasAllFunctionsAndPasses() {
		const obj = { func1: () => {}, func2() {}, foo: 'bar' }
		assert.hasAllFunctions(obj, ['func1', 'func2'])
	}

	@test()
	protected static hasAllFunctionsAndFails() {
		const obj = { func1: () => {}, func2() {}, foo: 'bar' }
		let errorHit = false
		try {
			assert.hasAllFunctions(obj, ['func1', 'func3'])
		} catch (err) {
			errorHit = true
			assert.include(err.message, 'func3')
		}
		assert.isTrue(errorHit)
	}

	@test()
	protected static isOkAssertsAnObject() {
		const run = (): string | undefined => {
			return 'test'
		}

		const value = run()
		assert.isOk(value)

		assert.isType<string>(value)
	}
}
