import deepEqual from 'deep-equal'
import { isObjectLike, includes, get } from 'lodash'
import { expectType } from 'ts-expect'
import AssertionError from './AssertionError'

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

class AssertUtils {
	public static fail(message?: string) {
		throw new AssertionError(message ?? 'Fail!')
	}

	public static doHaystacksIncludeWithoutAsserting(
		haystacks: any[],
		needle: any,
		doesInclude: ISpruceAssert['doesInclude']
	) {
		return haystacks.find(haystack => {
			try {
				doesInclude(haystack, needle)
				return true
			} catch {
				return false
			}
		})
	}

	public static assertTypeof(
		actual: any,
		type: string,
		message: string | undefined
	) {
		if (typeof actual !== type) {
			AssertUtils.fail(message ?? `${JSON.stringify(actual)} is not a ${type}`)
		}
	}

	public static checkDoesThrowError(
		matcher: string | RegExp | undefined,
		message: string,
		msg: string | undefined
	) {
		if (typeof matcher === 'string' && message.search(matcher) === -1) {
			AssertUtils.fail(
				msg ??
					`Function expected to return error whose message contains "${matcher}", but got back \`${message}\`.`
			)
		} else if (matcher instanceof RegExp && message.search(matcher) === -1) {
			AssertUtils.fail(
				msg ??
					`Function expected to return error whose message matches the regex "${matcher}", but got back \`${message}\`.`
			)
		}
	}

	public static partialContains(object: any, subObject: any) {
		const objProps = object ? Object.getOwnPropertyNames(object) : []
		const subProps = subObject ? Object.getOwnPropertyNames(subObject) : []

		if (objProps.length == 0 || subProps.length === 0) {
			return
		}

		if (subProps.length > objProps.length) {
			return false
		}

		for (const subProp of subProps) {
			if (!object.hasOwnProperty(subProp)) {
				return false
			}

			if (object[subProp] !== subObject[subProp]) {
				return false
			}
		}

		return true
	}

	public static valueAtPath(object: Record<string, any>, path: string) {
		return get(object, path)
	}

	public static parseIncludeNeedle(needle: any) {
		const path = Object.keys(needle)[0]
		const expected = needle[path]
		const needleHasArrayNotation = path.search(/\[\]\./) > -1
		return { needleHasArrayNotation, path, expected }
	}

	public static splitPathBasedOnArrayNotation(path: string, haystack: any) {
		const pathParts = path.split('[].')
		const pathToFirstArray = pathParts.shift() ?? ''
		const pathAfterFirstArray = pathParts.join('[].')
		const actualBeforeArray = AssertUtils.valueAtPath(
			haystack,
			pathToFirstArray
		)
		return { actualBeforeArray, pathAfterFirstArray }
	}

	public static foundUsing3rdPartyIncludes(
		haystack: any,
		needle: any,
		isHaystackObject: boolean
	) {
		let passed = false
		if (typeof haystack === 'string' && haystack.search(needle) > -1) {
			passed = true
		}

		if (isHaystackObject && includes(haystack, needle)) {
			passed = true
		}

		if (isHaystackObject && AssertUtils.partialContains(haystack, needle)) {
			passed = true
		}
		return passed
	}
}

const spruceAssert: ISpruceAssert = {
	areSameType() {},

	isType: expectType,

	isEqual(actual, expected, message) {
		if (actual !== expected) {
			AssertUtils.fail(
				message ??
					`${JSON.stringify(actual)} does not equal ${JSON.stringify(expected)}`
			)
		}
	},

	isNotEqual(actual, expected, message) {
		if (actual === expected) {
			AssertUtils.fail(
				message ??
					`${JSON.stringify(actual)} should not equal ${JSON.stringify(
						expected
					)}`
			)
		}
	},

	isEqualDeep(actual, expected, message) {
		if (!deepEqual(actual, expected)) {
			AssertUtils.fail(
				message ??
					`${JSON.stringify(actual)} does not deep equal(${JSON.stringify(
						expected
					)})`
			)
		}
	},

	isAbove(actual, floor, message) {
		if (actual <= floor) {
			AssertUtils.fail(
				message ??
					`${JSON.stringify(actual)} is not above ${JSON.stringify(floor)}`
			)
		}
	},

	isBelow(actual, ceiling, message) {
		if (actual >= ceiling) {
			AssertUtils.fail(
				message ??
					`${JSON.stringify(actual)} is not below ${JSON.stringify(ceiling)}`
			)
		}
	},

	isUndefined(actual, message) {
		if (typeof actual !== 'undefined') {
			AssertUtils.fail(message ?? `${JSON.stringify(actual)} is not undefined`)
		}
	},

	isOk(actual, message) {
		// @ts-ignore
		if (actual === false || actual === null || typeof actual === 'undefined') {
			AssertUtils.fail(message ?? `${JSON.stringify(actual)} is not ok`)
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

	doesInclude(haystack: any, needle: any, message?: string) {
		const msg =
			message ??
			`${JSON.stringify(haystack)} does not include ${JSON.stringify(needle)}`

		const isHaystackObject = isObjectLike(haystack)
		const {
			needleHasArrayNotation,
			path,
			expected
		} = AssertUtils.parseIncludeNeedle(needle)

		if (Array.isArray(haystack)) {
			let cleanedNeedle = needle

			if (path.substr(0, 3) === '[].') {
				cleanedNeedle = { [path.substr(3)]: expected }
			}

			const found = AssertUtils.doHaystacksIncludeWithoutAsserting(
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

		if (isHaystackObject && isObjectLike(needle) && !needleHasArrayNotation) {
			const actual = AssertUtils.valueAtPath(haystack, path)

			this.isEqual(expected, actual, msg)

			return
		}

		if (isHaystackObject && isObjectLike(needle)) {
			const {
				actualBeforeArray,
				pathAfterFirstArray
			} = AssertUtils.splitPathBasedOnArrayNotation(path, haystack)

			if (!Array.isArray(actualBeforeArray)) {
				AssertUtils.fail(msg)
			}

			const found = AssertUtils.doHaystacksIncludeWithoutAsserting(
				actualBeforeArray,
				{
					[pathAfterFirstArray]: expected
				},
				this.doesInclude.bind(this)
			)

			if (found) {
				return
			}
		}

		AssertUtils.fail(msg)
	},

	hasAllFunctions(obj, functionNames) {
		functionNames.forEach(name => {
			if (typeof obj[name] !== 'function') {
				AssertUtils.fail(
					`A function named "${name}" does not exist on ${JSON.stringify(obj)}`
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

		AssertUtils.fail('Expected a thrown error, but never got one!')
	},

	async doesThrowAsync(cb, matcher, msg) {
		try {
			await cb()
		} catch (err) {
			const message = (err.message ?? '**EMPTY ERROR MESSAGE**') as string

			AssertUtils.checkDoesThrowError(matcher, message, msg)

			return err
		}

		AssertUtils.fail('Expected a thrown error, but never got one!')
	},

	fail: AssertUtils.fail
}

export default spruceAssert
