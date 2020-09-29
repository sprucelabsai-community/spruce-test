import chalk from 'chalk'
import { includes, get, isObjectLike, isObject } from 'lodash'
import { ISpruceAssert } from '../assert'
import AssertionError from '../AssertionError'

export const UNDEFINED_PLACEHOLDER = '_____________undefined_____________'

const assertUtil = {
	fail(message?: string, stack?: string) {
		throw new AssertionError(message ?? 'Fail!', stack)
	},

	stringify(object: any): string {
		let stringified

		if (object instanceof RegExp) {
			stringified = `${object.toString()}`
		} else if (typeof object === 'undefined') {
			stringified = 'undefined'
		} else if (typeof object === 'string') {
			stringified = `"${object}"`
		} else {
			stringified = JSON.stringify(
				assertUtil.dropInUndefinedPlaceholder(object),
				undefined,
				2
			).replace(/\\/g, '')
		}

		if (stringified.length > 2500) {
			stringified =
				stringified.substr(0, 1000) +
				'\n\n... big object ...\n\n' +
				stringified.substr(stringified.length - 1000)
		}

		stringified = assertUtil.styleUndefinedPlaceholders(stringified)

		return `\n\n${chalk.bold(stringified)}\n\n`
	},

	styleUndefinedPlaceholders(str: string) {
		return str.replace(
			new RegExp(`"${UNDEFINED_PLACEHOLDER}"`, 'g'),
			chalk.italic('undefined')
		)
	},

	dropInUndefinedPlaceholder(obj: Record<string, any> | any[]) {
		if (!isObject(obj)) {
			return obj
		}
		const updated: Record<string, any> | any[] = Array.isArray(obj) ? [] : {}

		Object.keys(obj).forEach((key) => {
			//@ts-ignore
			updated[key] =
				// @ts-ignore
				typeof obj[key] === 'undefined' ? UNDEFINED_PLACEHOLDER : obj[key]

			//@ts-ignore
			if (isObject(updated[key])) {
				//@ts-ignore
				updated[key] = this.dropInUndefinedPlaceholder(updated[key])
			}
		})
		return updated
	},

	doHaystacksPassCheck(
		haystacks: any[],
		needle: any,
		check: ISpruceAssert['doesInclude']
	) {
		return !!haystacks.find((haystack) => {
			try {
				check(haystack, needle)
				return true
			} catch {
				return false
			}
		})
	},

	assertTypeof(actual: any, type: string, message: string | undefined) {
		if (typeof actual !== type) {
			this.fail(message ?? `${JSON.stringify(actual)} is not a ${type}`)
		}
	},

	checkDoesThrowError(
		matcher: string | RegExp | undefined,
		err: Error,
		msg?: string | undefined
	) {
		const message = err.message ?? '**MISSING ERROR MESSAGE**'

		if (typeof matcher === 'string' && message.search(matcher) === -1) {
			this.fail(
				msg ??
					`Function expected to return error whose message contains "${matcher}", but got back \`${message}\`.`,
				err.stack
			)
		} else if (matcher instanceof RegExp && message.search(matcher) === -1) {
			this.fail(
				msg ??
					`Function expected to return error whose message matches the regex "${matcher}", but got back \`${message}\`.`,
				err.stack
			)
		}
	},

	partialContains(object: any, subObject: any) {
		const objProps = object ? Object.getOwnPropertyNames(object) : []
		const subProps = subObject ? Object.getOwnPropertyNames(subObject) : []

		if (objProps.length == 0 || subProps.length === 0) {
			return
		}

		if (subProps.length > objProps.length) {
			return false
		}

		for (const subProp of subProps) {
			if (!Object.prototype.hasOwnProperty.call(object, subProp)) {
				return false
			}

			if (
				(!isObjectLike(object[subProp]) || !isObjectLike(subObject[subProp])) &&
				object[subProp] !== subObject[subProp]
			) {
				return false
			}

			if (
				isObjectLike(object[subProp]) &&
				isObjectLike(subObject[subProp]) &&
				!this.partialContains(object[subProp], subObject[subProp])
			) {
				return false
			}
		}

		return true
	},

	valueAtPath(object: Record<string, any>, path: string) {
		return get(object, path)
	},

	parseIncludeNeedle(
		needle: any
	): { needleHasArrayNotation: boolean; path?: string; expected?: any } {
		const path = Object.keys(needle)[0]
		const expected = path && needle[path]
		const needleHasArrayNotation = !!(path && path.search(/\[\]\./) > -1)
		return { needleHasArrayNotation, path, expected }
	},

	splitPathBasedOnArrayNotation(path: string, haystack: any) {
		const pathParts = path.split('[].')
		const pathToFirstArray = pathParts.shift() ?? ''
		const pathAfterFirstArray = pathParts.join('[].')
		const actualBeforeArray = this.valueAtPath(haystack, pathToFirstArray)
		return { actualBeforeArray, pathAfterFirstArray }
	},

	foundUsing3rdPartyIncludes(
		haystack: any,
		needle: any,
		isHaystackObject: boolean
	) {
		let passed = false
		if (
			typeof haystack === 'string' &&
			typeof needle === 'string' &&
			haystack.search(needle) > -1
		) {
			passed = true
		}

		if (isHaystackObject && includes(haystack, needle)) {
			passed = true
		}

		if (isHaystackObject && this.partialContains(haystack, needle)) {
			passed = true
		}
		return passed
	},
}

export default assertUtil
