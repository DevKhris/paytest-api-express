import { AppDataSource } from '../../data-source'

export async function cleanDatabase(): Promise<void> {
  await AppDataSource.getRepository('Transaction').delete({})
  await AppDataSource.getRepository('Session').delete({})
  await AppDataSource.getRepository('Contact').delete({})
  await AppDataSource.getRepository('Account').delete({})
  await AppDataSource.getRepository('User').delete({})
}
