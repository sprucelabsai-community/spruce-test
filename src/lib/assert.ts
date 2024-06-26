import chalk from 'chalk'
import deepEqual from 'deep-equal'
import escapeRegExp from 'lodash/escapeRegExp'
import isObjectLike from 'lodash/isObjectLike'
import { expectType } from 'ts-expect'
import diff from 'variable-diff'
import assertUtil from './assert.utility'

const stringify = assertUtil.stringify.bind(assertUtil)

type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object
          ? RecursivePartial<T[P]>
          : T[P]
}

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N
type IsAny<T> = IfAny<T, true, never>

type TypeEqual<T, U> =
    IsAny<T> extends never
        ? Exclude<T, U> extends never
            ? Exclude<U, T> extends never
                ? true
                : false
            : false
        : false

function isExactType<T, E, Pass = TypeEqual<T, E>>(_: Pass) {}

export interface ISpruceAssert {
    isNumber(actual: any, message?: string): asserts actual is number
    isType: typeof expectType
    isExactType: typeof isExactType
    isArray<T extends any[]>(actual: any, message?: string): asserts actual is T
    areSameType<T>(actual: T, expected: T): asserts actual is T
    isEqual<T>(actual: T, expected: T, message?: string): asserts actual is T
    isNotEqual<T>(actual: T, expected: T, message?: string): asserts actual is T
    isEqualDeep<T>(
        actual: T,
        expected: T,
        message?: string,
        shouldAppendDelta?: boolean
    ): asserts actual is T
    isAbove<T>(actual: T, floor: T, message?: string): void
    isBelow<T>(actual: T, ceiling: T, message?: string): void
    isUndefined<T>(actual: T, message?: string): void
    isTruthy<T = any>(
        value: T,
        message?: string
    ): asserts value is NonNullable<T>
    isFalsy(value: any, message?: string): void
    isTrue(
        actual: boolean | undefined | null,
        message?: string
    ): asserts actual is true
    isFalse(
        actual: boolean | undefined | null,
        message?: string
    ): asserts actual is false
    isObject<T>(actual: T, message?: string): void
    isLength(
        actual: any[] | undefined | null,
        expected: number,
        message?: string
    ): void
    isNull(actual: any, message?: string): void
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
    // eslint-disable-next-line
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

/**
 * @deprecated - Remove and re-import from @sprucelabs/test-utils
 */
const assert: ISpruceAssert = {
    areSameType() {},

    isType: expectType,

    isExactType,

    isNumber(actual, message) {
        if (typeof actual !== 'number') {
            this.fail(message ?? `${stringify(actual)} is not a number!`)
        }
    },

    isEqual(actual, expected, message) {
        if (actual !== expected) {
            this.fail(
                message ??
                    `${stringify(actual)} does not equal ${stringify(expected)}`
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

    isEqualDeep(actual, expected, message, shouldAppendDelta = true) {
        if (!deepEqual(actual, expected, { strict: true })) {
            const result = diff(actual, expected)
            this.fail(
                `${
                    message ??
                    `Deep equal failed.\n\nActual would need the following changes to match expected:`
                }${shouldAppendDelta ? `\n\n${result.text}` : ``}`
            )
        }
    },

    isAbove(actual, floor, message) {
        if (typeof actual !== 'number') {
            this.fail(message ?? `${stringify(actual)} is not a number!`)
        }
        if (actual <= floor) {
            this.fail(
                message ??
                    `${stringify(actual)} is not above ${stringify(floor)}`
            )
        }
    },

    isBelow(actual, ceiling, message) {
        if (typeof actual !== 'number') {
            this.fail(message ?? `${stringify(actual)} is not a number!`)
        }

        if (actual >= ceiling) {
            this.fail(
                message ??
                    `${stringify(actual)} is not below ${stringify(ceiling)}`
            )
        }
    },

    isUndefined(actual, message) {
        if (typeof actual !== 'undefined') {
            this.fail(message ?? `${stringify(actual)} is not undefined`)
        }
    },

    isTruthy(actual: any, message) {
        if (
            actual === false ||
            actual === null ||
            typeof actual === 'undefined' ||
            actual === 0
        ) {
            this.fail(message ?? `${stringify(actual)} is not truthy`)
        }
    },

    isFalsy(actual, message) {
        if (actual) {
            this.fail(message ?? `${stringify(actual)} is not falsy`)
        }
    },

    isNull(actual: any, message?) {
        if (actual !== null) {
            this.fail(message ?? `${stringify(actual)} is not null`)
        }
    },

    isString(actual, message) {
        assertUtil.assertTypeof(actual, 'string', message)
    },

    isFunction(actual, message) {
        assertUtil.assertTypeof(actual, 'function', message)
    },

    isTrue(actual, message) {
        //@ts-ignore
        this.isEqual(actual, true, message)
    },

    isFalse(actual, message) {
        //@ts-ignore
        this.isEqual(actual, false, message)
    },

    isObject(actual, message) {
        if (!isObjectLike(actual)) {
            throw this.fail(message ?? `${stringify(actual)} is not an object`)
        }
    },

    isArray(actual, message) {
        if (!Array.isArray(actual)) {
            throw this.fail(message ?? `${stringify(actual)} is not an array`)
        }
    },

    isLength(actual, expected, message) {
        if (!actual) {
            throw this.fail(
                message ??
                    `Expected array of length ${expected}, but got ${stringify(actual)}`
            )
        }

        //@ts-ignore
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
            `Could not find ${stringify(needle)} in ${stringify(haystack)}`

        const isNeedleString = typeof needle === 'string'
        const isNeedleRegex = needle instanceof RegExp

        if (
            typeof haystack === 'string' &&
            (isNeedleString || isNeedleRegex) &&
            haystack.search(isNeedleString ? escapeRegExp(needle) : needle) > -1
        ) {
            return
        }

        const isHaystackObject = isObjectLike(haystack)
        const { needleHasArrayNotation, path, expected } =
            assertUtil.parseIncludeNeedle(needle)

        if (Array.isArray(haystack)) {
            let cleanedNeedle = needle

            if (path && path.substr(0, 3) === '[].') {
                cleanedNeedle = { [path.substr(3)]: expected }
            }

            const found = assertUtil.doHaystacksPassCheck(
                haystack,
                cleanedNeedle,
                this.doesInclude.bind(this)
            )

            if (found) {
                return
            }
        }

        if (isHaystackObject && isObjectLike(needle)) {
            try {
                //@ts-ignore
                this.isEqualDeep(haystack, needle)
                return
            } catch {}
        }

        if (
            assertUtil.foundUsing3rdPartyIncludes(
                haystack,
                needle,
                isHaystackObject
            )
        ) {
            return
        }

        if (
            !Array.isArray(haystack) &&
            isHaystackObject &&
            isObjectLike(needle) &&
            Object.keys(needle).length === 1 &&
            !needleHasArrayNotation &&
            path
        ) {
            const actual = assertUtil.valueAtPath(haystack, path)

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

            if (
                typeof expected === 'string' &&
                typeof actual === 'string' &&
                actual.search(expected) > -1
            ) {
                return
            } else if (expected instanceof RegExp && expected.exec(actual)) {
                return
            } else {
                //@ts-ignore
                this.isEqualDeep(expected, actual, msg, false)
            }

            return
        }

        if (isHaystackObject && isObjectLike(needle) && path) {
            const { actualBeforeArray, pathAfterFirstArray } =
                assertUtil.splitPathBasedOnArrayNotation(path, haystack)

            if (!Array.isArray(actualBeforeArray)) {
                this.fail(msg)
            }

            const found = assertUtil.doHaystacksPassCheck(
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
        } catch (err: any) {
            assertUtil.checkDoesThrowError(matcher, err, msg)

            return err
        }

        this.fail('Expected a thrown error, but never got one!')
    },

    async doesThrowAsync(cb, matcher, msg) {
        try {
            await cb()
        } catch (err: any) {
            assertUtil.checkDoesThrowError(matcher, err, msg)

            return err
        }

        this.fail('Expected a thrown error, but never got one!')
    },

    fail: assertUtil.fail,
}

export default assert
