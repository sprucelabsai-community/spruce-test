import { assert } from 'chai'
import { expectType } from 'ts-expect'

// TODO: We could extend assert here
/**
 * 🌲🤖 Assert things in tests
 *
 * Extends the chai assert library: https://www.chaijs.com/api/assert/
 * */
const spruceAssert = {
	...assert,
	expectType
}

export default spruceAssert
