export interface ISpruce {
	mercury: any
}

export default class Spruce {
	/** The spruce object in all tests */
	public spruce(): ISpruce {
		return {
			mercury: 'go here'
		}
	}
}

export const spruce = new Spruce()
