import AbstractSpruceTest from '../AbstractSpruceTest'
import assert from '../assert'
import test from '../decorators'
import StackCleaner from '../StackCleaner'

export default class ErrorStackTest extends AbstractSpruceTest {
	@test(
		'removes test files',
		`Error: You called will-fail!
	at Object.willFail (/Users/taylorromero/Development/SpruceLabs/spruce-test/src/assert.ts:53:17)
	at Function.canRemoveTestFiles (/Users/taylorromero/Development/SpruceLabs/spruce-test/src/__tests__/ErrorStack.test.ts:8:10)
	at Object.<anonymous> (/Users/taylorromero/Development/SpruceLabs/spruce-test/src/decorators.ts:36:11)
	at Object.asyncJestTest (/Users/taylorromero/Development/SpruceLabs/spruce-test/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
	at /Users/taylorromero/Development/SpruceLabs/spruce-test/node_modules/jest-jasmine2/build/queueRunner.js:45:12
	at new Promise (<anonymous>)
	at mapper (/Users/taylorromero/Development/SpruceLabs/spruce-test/node_modules/jest-jasmine2/build/queueRunner.js:28:19)
	at /Users/taylorromero/Development/SpruceLabs/spruce-test/node_modules/jest-jasmine2/build/queueRunner.js:75:41
	at processTicksAndRejections (internal/process/task_queues.js:97:5)`,
		`Error: You called will-fail!
	at Function.canRemoveTestFiles (/Users/taylorromero/Development/SpruceLabs/spruce-test/src/__tests__/ErrorStack.test.ts:8:10)
	at new Promise (<anonymous>)`
	)
	@test(
		'drops babel crap',
		`TypeError: Cannot read property 'map' of undefined
    at Object (/Users/taylorromero/Development/SpruceLabs/spruce-mercury-api/src/databases/mongo.utilities.ts:21:17)
    at Array.forEach (<anonymous>)
    at mapNestedIdValues (/Users/taylorromero/Development/SpruceLabs/spruce-mercury-api/src/databases/mongo.utilities.ts:20:2)
    at Object.mongoUtil [as mapQuery] (/Users/taylorromero/Development/SpruceLabs/spruce-mercury-api/src/databases/mongo.utilities.ts:11:27)
    at MongoDatabase.toMongo…
    at Generator.next (/Users/taylorromero/Development/SpruceLabs/spruce-mercury-api/node_modules/regenerator-runtime/runtime.js:118:21)
    at asyncGeneratorStep (/Users/taylorromero/Development/SpruceLabs/spruce-mercury-api/node_modules/@babel/runtime/helpers/asyncToGenerator.js:3:24)
    at _next (/Users/taylorromero/Development/SpruceLabs/spruce-mercury-api/node_modules/@babel/runtime/helpers/asyncToGenerator.js:25:9)
    at processTicksAndRejections (internal/process/task_queues.js:97:5)`,
		`TypeError: Cannot read property 'map' of undefined
    at Object (/Users/taylorromero/Development/SpruceLabs/spruce-mercury-api/src/databases/mongo.utilities.ts:21:17)
    at Array.forEach (<anonymous>)
    at mapNestedIdValues (/Users/taylorromero/Development/SpruceLabs/spruce-mercury-api/src/databases/mongo.utilities.ts:20:2)
    at Object.mongoUtil [as mapQuery] (/Users/taylorromero/Development/SpruceLabs/spruce-mercury-api/src/databases/mongo.utilities.ts:11:27)
    at MongoDatabase.toMongo…`
	)
	protected static async removesExpected(stack: string, expected: string) {
		const cleaned = StackCleaner.clean(stack)
		assert.isEqual(cleaned, expected)
	}
}
