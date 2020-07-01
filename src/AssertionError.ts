import StackCleaner from './StackCleaner'

export default class AssertionError extends Error {
	public constructor(
		message: string,
		testResults?: { actual: any; expected: any }
	) {
		super(message)

		this.stack = StackCleaner.clean(this.stack ?? '')
	}
}
