import { assert, AssertionError } from 'chai'
import { expectType } from 'ts-expect'

/**
 * 🌲🤖 Assert things in tests
 *
 * Extends the chai assert library: https://www.chaijs.com/api/assert/
 * */

export interface ISpruceAssert
	extends Omit<Chai.AssertStatic, 'throws' | 'isString' | 'include'> {
	expectType: typeof expectType
	include<T>(haystack: T, needle: Partial<T>, message?: string): void
	include(haystack: string, needle: string, message?: string): void
	isString(value: any, message?: string | undefined): asserts value is string
	throws(
		cb: () => any | Promise<any>,
		matcher?: string | RegExp | undefined,
		msg?: string | undefined
	): Promise<void>
}

const spruceAssert: ISpruceAssert = {
	...assert,
	expectType,
	isString(value, message) {
		assert.isString(value, message)
	},
	async throws(cb, matcher, msg) {
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
