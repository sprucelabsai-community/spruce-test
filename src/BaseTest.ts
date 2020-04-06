// The Spruce object for all tests
export default class BaseTest {
	protected static async wait(ms: number) {
		return new Promise(resolve => {
			setTimeout(() => resolve(), ms)
		})
	}
}
