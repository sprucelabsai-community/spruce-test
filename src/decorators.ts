import ava from 'ava'
import { spruce } from './TestSpruce'

/** Hooks up before, after, etc. */
function hookupTestClass(target: any) {
	if (target.__isHookedUp) {
		return
	}
	target.__isHookedUp = true
	const hooks = ['before', 'beforeEach', 'after', 'afterEach']
	hooks.forEach(hook => {
		// Have they defined a hook
		if (!target[hook]) {
			return
		}
		// @ts-ignore
		ava[hook](async t => {
			// Mixin execution context to the spruce object
			const sp = spruce.mixinExecutionContext(t)

			// Invoke the hook method
			await target[hook](sp)

			// Save back context so it's available in the future
			t.context = sp.context
		})
	})
}

/** Test decorator */
export default function test(description: string) {
	return function(
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		// Make sure each test gets the spruce
		ava(description, t => {
			const sp = spruce.mixinExecutionContext(t)
			return descriptor.value(sp)
		})
	}
}

/** Only decorator */
test.only = (description: string) => {
	return function(
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		// Make sure each test gets the spruce
		ava.only(description, t => {
			const sp = spruce.mixinExecutionContext(t)
			return descriptor.value(sp)
		})
	}
}

/** Serial decorator */
test.serial = (description: string) => {
	return function(
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		// Make sure each test gets the spruce
		ava.serial(description, t => {
			const sp = spruce.mixinExecutionContext(t)
			return descriptor.value(sp)
		})
	}
}

/** Todo decorator */
test.todo = (description: string) => {
	return function(
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		// Lets attach before/after
		hookupTestClass(target)

		// Make sure each test gets the spruce
		ava.todo(description, t => {
			const sp = spruce.mixinExecutionContext(t)
			return descriptor.value(sp)
		})
	}
}
