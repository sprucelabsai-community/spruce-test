import StackCleaner from './StackCleaner'

/**
 * @deprecated delete and re-import from @sprucelabs/test-utils
 */
export default class AssertionError extends Error {
	public constructor(message: string, stack?: string) {
		super(message)
		this.message = StackCleaner.clean(message ? `${message}\n` : '')
		this.stack = StackCleaner.clean(
			`${this.message}${(stack ?? this.stack ?? '').replace(message, '')}`
		)
	}
}
