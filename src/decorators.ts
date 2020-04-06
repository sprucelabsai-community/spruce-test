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
		ava[hook](async t => target[hook](t, spruce.spruce()))
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

		// Make sure each test gets the spruce
		ava(description, t => {
			const sp = spruce.mixinExecutionContext(t)
			return descriptor.value(sp, ...args)
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

		// Make sure each test gets the spruce
		ava.only(description, t => {
			const sp = spruce.mixinExecutionContext(t)
			return descriptor.value(sp, ...args)
		})
	}
}

/** Serial decorator */
test.serial = (description: string, ...args: any[]) => {
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
			return descriptor.value(sp, ...args)
		})
	}
}

/** Todo decorator */
test.todo = (description: string) => {
	return function(target: any) {
		// Lets attach before/after
		hookupTestClass(target)

		// Make sure each test gets the spruce
		ava.todo(description)
	}
}
