import request from 'supertest'
import app from '../../index'

export async function registerAndLogin(
  roomCode: string = 'TRAINING01',
  name: string = 'Test User',
  password: string = 'password123'
): Promise<{ token: string; userId: string; accountId: string }> {
  const res = await request(app)
    .post('/auth/join')
    .send({ roomCode, name, password })

  if (res.status !== 201) {
    throw new Error(`Failed to register: ${JSON.stringify(res.body)}`)
  }

  return {
    token: res.body.data.token,
    userId: res.body.data.userId,
    accountId: res.body.data.accountId
  }
}
