import { assert, AssertionError } from 'chai'
import { expectType } from 'ts-expect'

type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? RecursivePartial<U>[]
		: T[P] extends object
		? RecursivePartial<T[P]>
		: T[P]
}

/**
 * 🌲🤖 Assert things in tests
 *
 * Extends the chai assert library: https://www.chaijs.com/api/assert/
 * */

export interface ISpruceAssert
	extends Omit<Chai.AssertStatic, 'throws' | 'isString' | 'include'> {
	expectType: typeof expectType
	include<T>(haystack: T, needle: RecursivePartial<T>, message?: string): void
	include(haystack: string, needle: string, message?: string): void
	include(haystack: any, needle: string, message?: string): void
	isString(value: any, message?: string | undefined): asserts value is string
	hasAllFunctions(obj: any, functionNames: string[]): void
	throws(
		cb: () => any | Promise<any>,
		matcher?: string | RegExp | undefined,
		msg?: string | undefined
	): Promise<Error>
}

const spruceAssert: ISpruceAssert = {
	...assert,
	expectType,
	hasAllFunctions(obj, functionNames) {
		functionNames.forEach(name => {
			if (typeof obj[name] !== 'function') {
				throw new AssertionError(
					`A function named "${name}" does not exist on ${JSON.stringify(obj)}`
				)
			}
		})
	},
	async throws(cb, matcher, msg) {
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
				return err
			}
		}
		throw new AssertionError('Function expected to throw error, but did not.')
	}
}

export default spruceAssert
