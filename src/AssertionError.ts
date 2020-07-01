import StackCleaner from './StackCleaner'

export default class AssertionError extends Error {
	public constructor(message: string) {
		super(message)
		this.stack = StackCleaner.clean(this.stack ?? '')
	}
}
