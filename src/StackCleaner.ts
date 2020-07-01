export default class StackCleaner {
	private static matchPattern = /spruce-test\/(?!src\/__tests__)/gi

	public static clean(stack: string): string {
		const lines = stack.split(/\r?\n/)
		const filtered = lines.filter(line => line.search(this.matchPattern) === -1)
		const newStack = filtered.join('\n')

		return newStack
	}
}
