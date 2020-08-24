import chalk from 'chalk'
import { includes, get } from 'lodash'
import { ISpruceAssert } from './assert'
import AssertionError from './AssertionError'

export class AssertUtils {
	public static fail(message?: string) {
		throw new AssertionError(message ?? 'Fail!')
	}

	public static stringify(object: any): string {
		let stringified

		if (object instanceof RegExp) {
			stringified = `${object.toString()}`
		} else if (typeof object === 'undefined') {
			stringified = 'undefined'
		} else if (typeof object === 'string') {
			stringified = `"${object}"`
		} else {
			stringified = JSON.stringify(object, undefined, 2).replace(/\\/g, '')
		}

		if (stringified.length > 2500) {
			stringified =
				stringified.substr(0, 1000) +
				'\n\n... big object ...\n\n' +
				stringified.substr(stringified.length - 1000)
		}

		return `\n\n${chalk.bold(stringified)}\n\n`
	}

	public static doHaystacksPassCheck(
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
	}

	public static assertTypeof(
		actual: any,
		type: string,
		message: string | undefined
	) {
		if (typeof actual !== type) {
			this.fail(message ?? `${JSON.stringify(actual)} is not a ${type}`)
		}
	}

	public static checkDoesThrowError(
		matcher: string | RegExp | undefined,
		message: string,
		msg: string | undefined
	) {
		if (typeof matcher === 'string' && message.search(matcher) === -1) {
			this.fail(
				msg ??
					`Function expected to return error whose message contains "${matcher}", but got back \`${message}\`.`
			)
		} else if (matcher instanceof RegExp && message.search(matcher) === -1) {
			this.fail(
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
			if (!Object.prototype.hasOwnProperty.call(object, subProp)) {
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
		const needleHasArrayNotation = path && path.search(/\[\]\./) > -1
		return { needleHasArrayNotation, path, expected }
	}

	public static splitPathBasedOnArrayNotation(path: string, haystack: any) {
		const pathParts = path.split('[].')
		const pathToFirstArray = pathParts.shift() ?? ''
		const pathAfterFirstArray = pathParts.join('[].')
		const actualBeforeArray = this.valueAtPath(haystack, pathToFirstArray)
		return { actualBeforeArray, pathAfterFirstArray }
	}

	public static foundUsing3rdPartyIncludes(
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
	}
}
