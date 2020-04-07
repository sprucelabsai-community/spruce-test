/** Base test class chalk full of helpers to make testing more 🔥🔥🔥 */
export default class BaseTest {
	protected static async wait(ms: number) {
		return new Promise(resolve => {
			setTimeout(() => resolve(), ms)
		})
	}
}
