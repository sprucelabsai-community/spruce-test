import { ISpruce } from './BaseTest'

export default class TestSpruce {
	/** The spruce object in all tests */
	public spruce() {
		return {
			mercury: 'gos heres',
			context: {}
		}
	}

	/** Attach the context to the beforeEach of a test file */
	public mixinExecutionContext(t: any): ISpruce {
		const spruce = this.spruce()
		const ctx = {
			...spruce,
			...t,
			context: {
				...(t.context || {}),
				...(spruce.context || {})
			}
		}

		return ctx
	}
}

export const spruce = new TestSpruce()
