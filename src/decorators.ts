/** Hooks up before, after, etc. */
function hookupTestClass(target: any) {
	if (target.__isHookedUp) {
		return
	}
	target.__isHookedUp = true
	const hooks = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach']
	hooks.forEach((hook) => {
		// Have they defined a hook
		if (!target[hook]) {
			return
		}

		// @ts-ignore
		if (global[hook]) {
			// @ts-ignore
			global[hook](async () => target[hook]())
		}
	})
}

/** Test decorator */
export default function test(description?: string, ...args: any[]) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		const bound = descriptor.value.bind(target)

		// Make sure each test gets the spruce
		it(description ?? propertyKey, async () => {
			return bound(...args)
		})
	}
}

/** Only decorator */
test.only = (description?: string, ...args: any[]) => {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		const bound = descriptor.value.bind(target)

		// Make sure each test gets the spruce
		it.only(description ?? propertyKey, async () => {
			return bound(...args)
		})
	}
}

/** Todo decorator */
test.todo = (description?: string, ..._args: any[]) => {
	return function (target: any, propertyKey: string) {
		// Lets attach before/after
		hookupTestClass(target)

		// Make sure each test gets the spruce
		it.todo(description ?? propertyKey)
	}
}

/** Skip decorator */
test.skip = (description?: string, ...args: any[]) => {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		const bound = descriptor.value.bind(target)

		// Make sure each test gets the spruce
		it.skip(description ?? propertyKey, async () => {
			return bound(...args)
		})
	}
}
