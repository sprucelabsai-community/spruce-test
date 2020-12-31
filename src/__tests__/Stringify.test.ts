import chalk from 'chalk'
import AbstractSpruceTest, { assert } from '..'
import test from '../decorators'
import assertUtil, {
	FUNCTION_PLACEHOLDER,
	UNDEFINED_PLACEHOLDER,
	NULL_PLACEHOLDER,
} from '../utilities/assert.utility'

export default class StringifyTest extends AbstractSpruceTest {
	@test(
		'one level deep (undefined)',
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
		'one level deep (null)',
		{
			hello: 'world',
			null: null,
		},
		`{
  "hello": "world",
  "null": "${NULL_PLACEHOLDER}"
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
	@test(
		'prints a function nicely',
		{ hello: () => {} },
		`{
  "hello": "${FUNCTION_PLACEHOLDER}"
}`
	)
	protected static printsPlaceholderFields(
		obj: Record<string, any>,
		expected: string
	) {
		const stringified = assertUtil.stringify(obj)

		assert.isEqual(
			stringified,
			'\n\n' + chalk.bold(assertUtil.replacePlaceholders(expected)) + '\n\n'
		)
	}
}
