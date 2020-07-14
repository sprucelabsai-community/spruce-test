import chalk from 'chalk'
import deepEqual from 'deep-equal'
import { isObjectLike, escapeRegExp } from 'lodash'
import { expectType } from 'ts-expect'
import { AssertUtils } from './AssertUtils'

const stringify = AssertUtils.stringify

type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? RecursivePartial<U>[]
		: T[P] extends object
		? RecursivePartial<T[P]>
		: T[P]
}

export interface ISpruceAssert {
	isType: typeof expectType
	areSameType<T extends any>(actual: T, expected: T): void
	isEqual<T extends any>(actual: T, expected: T, message?: string): void
	isNotEqual<T extends any>(actual: T, expected: T, message?: string): void
	isEqualDeep<T extends any>(actual: T, expected: T, message?: string): void
	isAbove<T extends any>(actual: T, floor: T, message?: string): void
	isBelow<T extends any>(actual: T, ceiling: T, message?: string): void
	isUndefined<T extends any>(actual: T, message?: string): void
	/* Not false, undefined, or null */
	isOk<T extends any>(
		value: T,
		message?: string
	): asserts value is NonNullable<T>
	isTrue(actual: boolean, message?: string): asserts actual is true
	isFalse(actual: boolean, message?: string): asserts actual is false
	isObject<T extends any>(actual: T, message?: string): void
	isLength(actual: any[], expected: number, message?: string): void
	doesNotInclude<T>(
		haystack: T,
		needle: RecursivePartial<T>,
		message?: string
	): void

	doesNotInclude(haystack: string, needle: string, message?: string): void
	doesNotInclude(haystack: any, needle: string, message?: string): void
	doesNotInclude(haystack: any, needle: any, message?: string): void

	doesInclude<T>(
		haystack: T,
		needle: RecursivePartial<T>,
		message?: string
	): void

	doesInclude(haystack: string, needle: string, message?: string): void
	doesInclude(haystack: any, needle: string, message?: string): void
	doesInclude(haystack: any, needle: any, message?: string): void

	isString(actual: any, message?: string): asserts actual is string
	isFunction(actual: any, message?: string): asserts actual is Function
	hasAllFunctions(obj: any, functionNames: string[]): void
	doesThrow(
		cb: () => any,
		matcher?: string | RegExp | undefined,
		msg?: string | undefined
	): Error
	doesThrowAsync(
		cb: () => any | Promise<any>,
		matcher?: string | RegExp | undefined,
		msg?: string | undefined
	): Promise<Error>
	fail(message?: string): void
}

const spruceAssert: ISpruceAssert = {
	areSameType() {},

	isType: expectType,

	isEqual(actual, expected, message) {
		if (actual !== expected) {
			this.fail(
				message ?? `${stringify(actual)} does not equal ${stringify(expected)}`
			)
		}
	},

	isNotEqual(actual, expected, message) {
		if (actual === expected) {
			this.fail(
				message ??
					`${stringify(actual)} should not equal ${stringify(expected)}`
			)
		}
	},

	isEqualDeep(actual, expected, message) {
		if (!deepEqual(actual, expected)) {
			this.fail(
				message ??
					`${stringify(actual)} does not deep equal(${stringify(expected)})`
			)
		}
	},

	isAbove(actual, floor, message) {
		if (actual <= floor) {
			this.fail(
				message ?? `${stringify(actual)} is not above ${stringify(floor)}`
			)
		}
	},

	isBelow(actual, ceiling, message) {
		if (actual >= ceiling) {
			this.fail(
				message ?? `${stringify(actual)} is not below ${stringify(ceiling)}`
			)
		}
	},

	isUndefined(actual, message) {
		if (typeof actual !== 'undefined') {
			this.fail(message ?? `${stringify(actual)} is not undefined`)
		}
	},

	isOk(actual, message) {
		// @ts-ignore
		if (actual === false || actual === null || typeof actual === 'undefined') {
			this.fail(message ?? `${stringify(actual)} is not ok`)
		}
	},

	isString(actual, message) {
		AssertUtils.assertTypeof(actual, 'string', message)
	},

	isFunction(actual, message) {
		AssertUtils.assertTypeof(actual, 'function', message)
	},

	isTrue(actual, message) {
		this.isEqual(actual, true, message)
	},

	isFalse(actual, message) {
		this.isEqual(actual, false, message)
	},

	isObject(actual, message) {
		if (!isObjectLike(actual)) {
			throw this.fail(message ?? `${stringify(actual)} is not an object`)
		}
	},

	isLength(actual, expected, message) {
		this.isEqual(
			actual.length,
			expected,
			message ??
				`Expected length of ${stringify(
					expected
				)}, but got a length of ${stringify(actual.length)}`
		)
	},

	doesNotInclude(haystack: any, needle: any, message?: string) {
		let doesInclude = false
		try {
			this.doesInclude(haystack, needle)
			doesInclude = true
		} catch {
			doesInclude = false
		}

		if (doesInclude) {
			this.fail(
				message ??
					`${stringify(haystack)} should not include ${stringify(
						needle
					)}, but it does`
			)
		}
	},

	doesInclude(haystack: any, needle: any, message?: string) {
		let msg =
			message ??
			`Could not find ${chalk.green(stringify(needle))} in ${chalk.italic(
				stringify(haystack)
			)}`

		const isNeedleString = typeof needle === 'string'
		const isNeedleRegex = needle instanceof RegExp

		if (
			typeof haystack === 'string' &&
			(isNeedleString || isNeedleRegex) &&
			haystack.search(
				isNeedleString && !(needle instanceof RegExp)
					? escapeRegExp(needle)
					: needle
			) > -1
		) {
			return
		}

		const isHaystackObject = isObjectLike(haystack)
		const {
			needleHasArrayNotation,
			path,
			expected,
		} = AssertUtils.parseIncludeNeedle(needle)

		if (Array.isArray(haystack)) {
			let cleanedNeedle = needle

			if (path.substr(0, 3) === '[].') {
				cleanedNeedle = { [path.substr(3)]: expected }
			}

			const found = AssertUtils.doHaystacksPassCheck(
				haystack,
				cleanedNeedle,
				this.doesInclude.bind(this)
			)

			if (found) {
				return
			}
		}

		if (
			AssertUtils.foundUsing3rdPartyIncludes(haystack, needle, isHaystackObject)
		) {
			return
		}

		if (
			!Array.isArray(haystack) &&
			isHaystackObject &&
			isObjectLike(needle) &&
			isObjectLike(needle) &&
			Object.keys(needle).length === 1 &&
			!needleHasArrayNotation
		) {
			const actual = AssertUtils.valueAtPath(haystack, path)

			if (typeof actual === 'undefined') {
				msg = `The path ${stringify(path)} was not found in ${stringify(
					haystack
				)}`
			} else {
				msg = `Expected ${chalk.green(
					stringify(needle[path])
				)} but found ${chalk.red(stringify(actual))} at ${stringify(
					path
				)} in ${stringify(haystack)}`
			}

			this.isEqualDeep(expected, actual, msg)

			return
		}

		if (isHaystackObject && isObjectLike(needle)) {
			const {
				actualBeforeArray,
				pathAfterFirstArray,
			} = AssertUtils.splitPathBasedOnArrayNotation(path, haystack)

			if (!Array.isArray(actualBeforeArray)) {
				this.fail(msg)
			}

			const found = AssertUtils.doHaystacksPassCheck(
				actualBeforeArray,
				{
					[pathAfterFirstArray]: expected,
				},
				this.doesInclude.bind(this)
			)

			if (found) {
				return
			}

			msg = `Could not find match ${stringify(expected)} at ${stringify(
				pathAfterFirstArray
			)} in ${stringify(actualBeforeArray)}.`
		}

		this.fail(msg)
	},

	hasAllFunctions(obj, functionNames) {
		functionNames.forEach((name) => {
			if (typeof obj[name] !== 'function') {
				this.fail(
					`A function named "${name}" does not exist on ${stringify(obj)}`
				)
			}
		})
	},

	doesThrow(cb, matcher, msg) {
		try {
			cb()
		} catch (err) {
			const message = (err.message ?? '**EMPTY ERROR MESSAGE**') as string
			AssertUtils.checkDoesThrowError(matcher, message, msg)

			return err
		}

		this.fail('Expected a thrown error, but never got one!')
	},

	async doesThrowAsync(cb, matcher, msg) {
		try {
			await cb()
		} catch (err) {
			const message = (err.message ?? '**EMPTY ERROR MESSAGE**') as string

			AssertUtils.checkDoesThrowError(matcher, message, msg)

			return err
		}

		this.fail('Expected a thrown error, but never got one!')
	},

	fail: AssertUtils.fail,
}

export default spruceAssert
