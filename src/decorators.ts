import { spruce } from './Spruce'

/** Hooks up before, after, etc. */
function hookupTestClass(target: any) {
	if (target.__isHookedUp) {
		return
	}
	target.__isHookedUp = true
	const hooks = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach']
	hooks.forEach(hook => {
		// Have they defined a hook
		if (!target[hook]) {
			return
		}

		// @ts-ignore
		if (global[hook]) {
			// @ts-ignore
			global[hook](async () => target[hook](spruce.spruce()))
		}
	})
}

/** Test decorator */
export default function test(description: string, ...args: any[]) {
	return function(
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		const bound = descriptor.value.bind(target)

		// Make sure each test gets the spruce
		it(description, async () => {
			return bound(spruce.spruce(), ...args)
		})
	}
}

/** Only decorator */
test.only = (description: string, ...args: any[]) => {
	return function(
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		const bound = descriptor.value.bind(target)

		// Make sure each test gets the spruce
		it.only(description, async () => {
			return bound(spruce.spruce(), ...args)
		})
	}
}

// Nothing special needed. With jest, tests in the same file will run sequentially already
/** Serial decorator */
test.serial = (description: string, ...args: any[]) => {
	return function(
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		const bound = descriptor.value.bind(target)

		// Make sure each test gets the spruce
		it(description, async () => {
			return bound(spruce.spruce(), ...args)
		})
	}
}

/** Todo decorator */
test.todo = (description: string, ..._args: any[]) => {
	return function(
		target: any,
		_propertyKey: string,
		_descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		// Make sure each test gets the spruce
		it.todo(description)
	}
}

/** Skip decorator */
test.skip = (description: string, ...args: any[]) => {
	return function(
		target: any,
		_propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		const bound = descriptor.value.bind(target)

		// Make sure each test gets the spruce
		it.skip(description, async () => {
			return bound(spruce.spruce(), ...args)
		})
	}
}
