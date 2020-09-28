import chalk from 'chalk'
import AbstractSpruceTest, { assert } from '..'
import test from '../decorators'
import assertUtil, { UNDEFINED_PLACEHOLDER } from '../utilities/assert.utility'

export default class StringifyTest extends AbstractSpruceTest {
	@test(
		'one level deep',
		{
			hello: 'world',
			undefined,
		},
		`{
  "hello": "world",
  "undefined": "${UNDEFINED_PLACEHOLDER}"
}`
	)
	@test(
		'two levels deep',
		{
			hello: 'world',
			undefinedDeep: {
				undefined,
			},
		},
		`{
  "hello": "world",
  "undefinedDeep": {
    "undefined": "${UNDEFINED_PLACEHOLDER}"
  }
}`
	)
	@test(
		'three levels deep',
		{
			hello: 'world',
			undefinedDeep: {
				undefinedDeepAgain: {
					undefined,
				},
			},
		},
		`{
  "hello": "world",
  "undefinedDeep": {
    "undefinedDeepAgain": {
      "undefined": "${UNDEFINED_PLACEHOLDER}"
    }
  }
}`
	)
	protected static printsUndefinedFieldsAtTopLevel(
		obj: Record<string, any>,
		expected: string
	) {
		const stringified = assertUtil.stringify(obj)
		assert.isEqual(
			stringified,
			'\n\n' +
				chalk.bold(assertUtil.styleUndefinedPlaceholders(expected)) +
				'\n\n'
		)
	}
}
