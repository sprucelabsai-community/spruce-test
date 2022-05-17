import chalk from 'chalk'
import { includes, get, isObjectLike, isObject } from 'lodash'
import { ISpruceAssert } from '../assert'
import AssertionError from '../AssertionError'

export const UNDEFINED_PLACEHOLDER = '_____________undefined_____________'
export const FUNCTION_PLACEHOLDER = '_____________function_____________'
export const CIRCULAR_PLACEHOLDER = '_____________circular_____________'
export const NULL_PLACEHOLDER = '_____________null_____________'

const assertUtil = {
	fail(message?: string, stack?: string) {
		throw new AssertionError(message ?? 'Fail!', stack)
	},

	stringify(object: any): string {
		let stringified

		if (Array.isArray(object)) {
			stringified = `[\n${object.map((o) =>
				this.stringify(o).split('\n').join('\n\t')
			)}\n]`
		} else if (typeof object === 'number') {
			// this hack allows the Spruce Test Reporter to render number errors (they got eaten by terminal-kit's style regex)
			stringified = chalk.bgBlack.white(` ${object} `)
		} else if (object instanceof Error) {
			stringified = `${object.stack ?? object.message}`
		} else if (object instanceof RegExp) {
			stringified = `${object.toString()}`
		} else if (typeof object === 'undefined') {
			stringified = 'undefined'
		} else if (typeof object === 'string') {
			stringified = `"${object}"`
		} else {
			stringified = JSON.stringify(
				assertUtil.dropInPlaceholders(object),
				undefined,
				2
			).replace(/\\/g, '')
		}

		if (stringified.length > 5000) {
			stringified =
				stringified.substr(0, 1000) +
				'\n\n... big object ...\n\n' +
				stringified.substr(stringified.length - 1000)
		}

		stringified = assertUtil.replacePlaceholders(stringified)

		return `\n\n${chalk.bold(stringified)}\n\n`
	},

	replacePlaceholders(str: string) {
		return str
			.replace(
				new RegExp(`"${UNDEFINED_PLACEHOLDER}"`, 'g'),
				chalk.italic('undefined')
			)
			.replace(
				new RegExp(`"${FUNCTION_PLACEHOLDER}"`, 'g'),
				chalk.italic('Function')
			)
			.replace(new RegExp(`"${NULL_PLACEHOLDER}"`, 'g'), chalk.italic('NULL'))
	},

	dropInPlaceholders(obj: Record<string, any>) {
		const checkedObjects: { obj: any; depth: number }[] = [{ obj, depth: 0 }]

		let updated = this.dropInPlaceholder(
			obj,
			(obj, depth) => {
				if (
					isObject(obj) &&
					checkedObjects.some((checked) => {
						return checked.obj === obj && checked.depth < depth
					})
				) {
					return true
				}

				checkedObjects.push({ obj, depth })

				return false
			},
			CIRCULAR_PLACEHOLDER
		)

		updated = this.dropInPlaceholder(
			updated,
			(obj) => typeof obj === 'undefined',
			UNDEFINED_PLACEHOLDER
		)

		updated = this.dropInPlaceholder(
			updated,
			(obj) => typeof obj === 'function',
			FUNCTION_PLACEHOLDER
		)

		updated = this.dropInPlaceholder(
			updated,
			(obj) => obj === null,
			NULL_PLACEHOLDER
		)

		return updated
	},

	dropInPlaceholder(
		obj: Record<string, any>,
		checker: (obj: any, depth: number) => boolean,
		placeholder: string,
		depth = 1
	) {
		if (!isObject(obj)) {
			return obj
		}
		const updated: Record<string, any> | any[] = Array.isArray(obj) ? [] : {}

		Object.keys(obj).forEach((key) => {
			//@ts-ignore
			updated[key] =
				// @ts-ignore
				checker(obj[key], depth) ? placeholder : obj[key]

			//@ts-ignore
			if (typeof updated[key] !== 'function' && isObject(updated[key])) {
				//@ts-ignore
				updated[key] = this.dropInPlaceholder(
					//@ts-ignore
					updated[key],
					checker,
					placeholder,
					depth + 1
				)
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
		const message = err.stack ?? err.message ?? '**MISSING ERROR MESSAGE**'

		if (typeof matcher === 'string' && message.search(matcher) === -1) {
			this.fail(
				msg ??
					`Expected thrown error whose message contains: \n\n'${chalk.bold(
						matcher
					)}\n\nbut got back:\n\n\`${chalk.bold(message)}\`.`,
				'\n\nStack: ' + err.stack
			)
		} else if (matcher instanceof RegExp && message.search(matcher) === -1) {
			this.fail(
				msg ??
					`Expected thrown error whose message matches the regex: \n\n${chalk.bold(
						matcher
					)}\n\nbut got back:\n\n\`${chalk.bold(message)}\`.`,
				'\n\nStack: ' + err.stack
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

	parseIncludeNeedle(needle: any): {
		needleHasArrayNotation: boolean
		path?: string
		expected?: any
	} {
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
