import { ExecutionContext } from 'ava'

// The Spruce object for all tests
export interface ISpruce<Context = unknown> extends ExecutionContext<Context> {
	mercury: any
}

export default class BaseTest {
	protected static async wait(ms: number) {
		return new Promise(resolve => {
			setTimeout(() => resolve(), ms)
		})
	}
}
