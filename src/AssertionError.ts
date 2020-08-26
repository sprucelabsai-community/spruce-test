import StackCleaner from './StackCleaner'

export default class AssertionError extends Error {
	public constructor(message: string, stack?: string) {
		super(message)
		this.stack = StackCleaner.clean(stack ?? this.stack ?? '')
	}
}
