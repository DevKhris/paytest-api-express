import { nanoid, customAlphabet } from 'nanoid'

const USER_ID_LENGTH = 12
const TOKEN_LENGTH = 32

const alphanumericUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const generateUserIdInternal = customAlphabet(alphanumericUppercase, USER_ID_LENGTH)

export function generateUserId(): string {
  return generateUserIdInternal()
}

export function generateToken(): string {
  return nanoid(TOKEN_LENGTH)
}

export function generateIdempotencyKey(prefix: string): string {
  return `${prefix}-${nanoid(16)}`
}