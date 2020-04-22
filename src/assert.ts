import { assert } from 'chai'

export interface ISpruceAssert extends Chai.AssertStatic {}

// TODO: We could extend assert here
/**
 * 🌲🤖 Assert things in tests
 *
 * Extends the chai assert library: https://www.chaijs.com/api/assert/
 * */
const spruceAssert: ISpruceAssert = assert
export default spruceAssert
