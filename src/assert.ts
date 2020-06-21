import { assert, AssertionError } from 'chai'
import { expectType } from 'ts-expect'

/**
 * 🌲🤖 Assert things in tests
 *
 * Extends the chai assert library: https://www.chaijs.com/api/assert/
 * */

export interface ISpruceAssert extends Omit<Chai.AssertStatic, 'throws'> {
	expectType: typeof expectType
	throws: (
		cb: () => any | Promise<any>,
		matcher?: string | RegExp | undefined,
		msg?: string | undefined
	) => Promise<void>
}

const spruceAssert: ISpruceAssert = {
	...assert,
	expectType,
	isString(value: any, message?: string | undefined): asserts value is string {
		assert.isString(value, message)
	},
	async throws(
		cb: () => any | Promise<any>,
		matcher?: string | RegExp | undefined,
		msg?: string | undefined
	): Promise<void> {
		let pass = false
		try {
			await cb()
		} catch (err) {
			const message = (err.message ?? '**EMPTY ERROR MESSAGE**') as string
			if (typeof matcher === 'string' && message.search(matcher) === -1) {
				throw new AssertionError(
					msg ??
						`Function expected to return error whose message contains "${matcher}", but got back ${message}.`
				)
			} else if (matcher instanceof RegExp && message.search(matcher) === -1) {
				throw new AssertionError(
					msg ??
						`Function expected to return error whose message matches the regex "${matcher}", but got back ${message}.`
				)
			} else {
				pass = true
			}
		}
		if (!pass) {
			throw new AssertionError('Function expected to throw error, but did not.')
		}
	}
}

export default spruceAssert
