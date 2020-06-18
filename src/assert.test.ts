import BaseSpruceTest from './BaseSpruceTest'
import test from './decorators'
import assert from './assert'

interface ICustomObj {
	testStr: string
}

export default class AssertTest extends BaseSpruceTest {
	@test('can assert types')
	protected static async doesCallBeforeAll() {
		assert.expectType<string>('string')
		assert.expectType<number>(123)

		const myCustomObj: ICustomObj = {
			testStr: 'blah'
		}

		assert.expectType<ICustomObj>(myCustomObj)
	}
}
