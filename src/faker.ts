import faker from 'faker'

interface ISpruceFaker extends Faker.FakerStatic {}

// TODO: We could extend faker here
/**
 * 🌲🤖 Generate fake data for tests
 *
 * Extends the faker.js library: https://github.com/marak/Faker.js/
 * */
const spruceFaker: ISpruceFaker = faker
export default spruceFaker
