import { AppDataSource } from '../data-source'

beforeAll(async () => {
  await AppDataSource.initialize()
})

beforeEach(async () => {
  await AppDataSource.getRepository('Transaction').delete({})
  await AppDataSource.getRepository('Session').delete({})
  await AppDataSource.getRepository('Contact').delete({})
  await AppDataSource.getRepository('Account').delete({})
  await AppDataSource.getRepository('User').delete({})
})

afterAll(async () => {
  await AppDataSource.destroy()
})
