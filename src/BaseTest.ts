/* eslint-disable no-undef */
// The base test model that all others will extend
export default class BaseTest {
	// Auto hookup before/after/beforeEach/afterEach
	public constructor() {
		before(() => this.before())
		after(() => this.after())
		beforeEach(() => this.beforeEach())
		afterEach(() => this.afterEach())
		this.setup()
	}

	protected setup() {}

	protected async beforeEach() {}

	protected async afterEach() {}

	protected async before() {}

	protected async after() {}

	protected async wait(ms: number) {
		return new Promise(resolve => {
			setTimeout(() => resolve(), ms)
		})
	}
}
