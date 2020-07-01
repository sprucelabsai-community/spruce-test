import { expectType } from 'ts-expect'
import AssertionError from './AssertionError'
import { isObjectLike, includes, get } from 'lodash'
import { assert } from '..'

type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? RecursivePartial<U>[]
		: T[P] extends object
		? RecursivePartial<T[P]>
		: T[P]
}

function assertTypeof(actual: any, type: string, message: string | undefined) {
	if (typeof actual !== type) {
		throw new AssertionError(
			message ?? `${JSON.stringify(actual)} is not a ${type}`
		)
	}
}

function checkDoesThrowError(
	matcher: string | RegExp | undefined,
	message: string,
	msg: string | undefined
) {
	if (typeof matcher === 'string' && message.search(matcher) === -1) {
		throw new AssertionError(
			msg ??
				`Function expected to return error whose message contains "${matcher}", but got back \`${message}\`.`,
			{
				expected: matcher,
				actual: message
			}
		)
	} else if (matcher instanceof RegExp && message.search(matcher) === -1) {
		throw new AssertionError(
			msg ??
				`Function expected to return error whose message matches the regex "${matcher}", but got back \`${message}\`.`,
			{
				actual: message,
				expected: matcher
			}
		)
	}
}

function partialContains(object: any, subObject: any) {
	// Create arrays of property names
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

function valueAtPath(object: Record<string, any>, path: string) {
	return get(object, path)
}

/**
 * 🌲🤖 Assert things in tests ⚡️
 * */
export interface ISpruceAssert {
	isType: typeof expectType
	areSameType<T extends any>(actual: T, expected: T): void
	isEqual<T extends any>(actual: T, expected: T, message?: string): void
	isAbove<T extends any>(actual: T, floor: T, message?: string): void
	isBelow<T>(actual: T, ceiling: T, message?: string): void
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
}

const spruceAssert: ISpruceAssert = {
	areSameType() {},
	isType: expectType,
	isEqual(actual, expected, message) {
		if (actual !== expected) {
			throw new AssertionError(
				message ??
					`${JSON.stringify(actual)} does not equal ${JSON.stringify(expected)}`
			)
		}
	},
	isAbove(actual, floor, message) {
		if (actual <= floor) {
			throw new AssertionError(
				message ??
					`${JSON.stringify(actual)} is not above ${JSON.stringify(floor)}`
			)
		}
	},
	isBelow(actual, ceiling, message) {
		if (actual >= ceiling) {
			throw new AssertionError(
				message ??
					`${JSON.stringify(actual)} is not below ${JSON.stringify(ceiling)}`
			)
		}
	},
	isOk(actual, message) {
		// @ts-ignore
		if (actual === false || actual === null || typeof actual === 'undefined') {
			throw new AssertionError(message ?? `${JSON.stringify(actual)} is not ok`)
		}
	},
	isString(actual, message) {
		assertTypeof(actual, 'string', message)
	},
	isFunction(actual, message) {
		assertTypeof(actual, 'function', message)
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

		if (typeof haystack === 'string' && haystack.search(needle) === -1) {
			throw new AssertionError(msg)
		} else if (
			isObjectLike(haystack) &&
			!includes(haystack, needle) &&
			!partialContains(haystack, needle)
		) {
			if (isObjectLike(needle)) {
				const path = Object.keys(needle)[0]
				const expected = needle[path]

				if (path.search(/\[\]\./) > -1) {
					const pathParts = path.split('[].')
					const pathToArray = pathParts.shift() ?? ''
					const pathAfterArray = pathParts.join('[].')
					const actualBeforeArray = valueAtPath(haystack, pathToArray)

					if (!Array.isArray(actualBeforeArray)) {
						throw new AssertionError(msg)
					}

					const match = actualBeforeArray.find(item => {
						try {
							debugger
							this.doesInclude(item, { [pathAfterArray]: expected }, message)
							return true
						} catch {
							debugger
							return false
						}
					})

					if (!match) {
						throw new AssertionError(msg)
					}
				} else {
					const actual = valueAtPath(haystack, path)
					assert.isEqual(expected, actual, msg)
				}
			} else {
				throw new AssertionError(msg)
			}
		}
	},
	hasAllFunctions(obj, functionNames) {
		functionNames.forEach(name => {
			if (typeof obj[name] !== 'function') {
				throw new AssertionError(
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
			checkDoesThrowError(matcher, message, msg)

			return err
		}

		throw new AssertionError('Expected a thrown error, but never got one!', {
			actual: undefined,
			expected: new Error()
		})
	},

	async doesThrowAsync(cb, matcher, msg) {
		try {
			await cb()
		} catch (err) {
			const message = (err.message ?? '**EMPTY ERROR MESSAGE**') as string
			checkDoesThrowError(matcher, message, msg)

			return err
		}

		throw new AssertionError('Expected a thrown error, but never got one!', {
			actual: undefined,
			expected: new Error()
		})
	}
}

export default spruceAssert
