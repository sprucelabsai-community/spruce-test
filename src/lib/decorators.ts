/** Hooks up before, after, etc. */
export function hookupTestClass(target: any) {
    if (target.__isTestingHookedUp) {
        return
    }
    target.__isTestingHookedUp = true
    const hooks = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach']
    hooks.forEach((hook) => {
        // Have they defined a hook
        if (!target[hook]) {
            return
        }

        // @ts-ignore
        if (global[hook]) {
            // @ts-ignore
            global[hook](async () => {
                return target[hook]()
            })
        }
    })
}
/**
 * @deprecated - Remove and re-import from @sprucelabs/test-utils
 */
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
        // eslint-disable-next-line no-undef
        it(description ?? propertyKey, async () => {
            //@ts-ignore
            global.activeTest = {
                file: target.name,
                test: propertyKey,
            }
            return bound(...args)
        })
    }
}

/**
 * @deprecated delete and re-import from @sprucelabs/test-utils
 */
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
        // eslint-disable-next-line no-undef
        it.only(description ?? propertyKey, async () => {
            return bound(...args)
        })
    }
}

/**
 * @deprecated delete and re-import from @sprucelabs/test-utils
 */
test.todo = (description?: string, ..._args: any[]) => {
    return function (target: any, propertyKey: string) {
        // Lets attach before/after
        hookupTestClass(target)

        // Make sure each test gets the spruce
        // eslint-disable-next-line no-undef
        it.todo(description ?? propertyKey)
    }
}

/**
 * @deprecated delete and re-import from @sprucelabs/test-utils
 */
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
        // eslint-disable-next-line no-undef
        it.skip(description ?? propertyKey, async () => {
            return bound(...args)
        })
    }
}
