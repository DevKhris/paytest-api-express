import { nanoid } from 'nanoid'

const USER_ID_LENGTH = 12
const TOKEN_LENGTH = 32

export function generateUserId(): string {
  return nanoid(USER_ID_LENGTH)
}

export function generateToken(): string {
  return nanoid(TOKEN_LENGTH)
}

export function generateIdempotencyKey(prefix: string): string {
  return `${prefix}-${nanoid(16)}`
}