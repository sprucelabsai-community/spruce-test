export default class StackCleaner {
	private static matchPattern = /spruce-test\/(?!src\/__tests__)|node_modules|internal\/process\/task_queues|@babel|regenerator-runtime\/runtime/gi

	public static clean(stack: string): string {
		const lines = stack.split(/\r?\n/)
		const filtered = lines.filter(
			(line) => line.search(this.matchPattern) === -1
		)
		const newStack = filtered.join('\n')

		return newStack
	}
}
