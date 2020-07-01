import AbstractSpruceTest from '../AbstractSpruceTest'
import assert from '../assert'
import test from '../decorators'
import StackCleaner from '../StackCleaner'

export default class ErrorStackTest extends AbstractSpruceTest {
	@test()
	protected static async canRemoveTestFiles() {
		const errorStack = `Error: You called will-fail!
        at Object.willFail (/Users/taylorromero/Development/SpruceLabs/spruce-test/src/assert.ts:53:17)
        at Function.canRemoveTestFiles (/Users/taylorromero/Development/SpruceLabs/spruce-test/src/__tests__/ErrorStack.test.ts:8:10)
        at Object.<anonymous> (/Users/taylorromero/Development/SpruceLabs/spruce-test/src/decorators.ts:36:11)
        at Object.asyncJestTest (/Users/taylorromero/Development/SpruceLabs/spruce-test/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
        at /Users/taylorromero/Development/SpruceLabs/spruce-test/node_modules/jest-jasmine2/build/queueRunner.js:45:12
        at new Promise (<anonymous>)
        at mapper (/Users/taylorromero/Development/SpruceLabs/spruce-test/node_modules/jest-jasmine2/build/queueRunner.js:28:19)
        at /Users/taylorromero/Development/SpruceLabs/spruce-test/node_modules/jest-jasmine2/build/queueRunner.js:75:41
		at processTicksAndRejections (internal/process/task_queues.js:97:5)`

		const expected = `Error: You called will-fail!
        at Function.canRemoveTestFiles (/Users/taylorromero/Development/SpruceLabs/spruce-test/src/__tests__/ErrorStack.test.ts:8:10)
        at new Promise (<anonymous>)
		at processTicksAndRejections (internal/process/task_queues.js:97:5)`

		const cleaned = StackCleaner.clean(errorStack)

		assert.isEqual(cleaned, expected)
	}
}
