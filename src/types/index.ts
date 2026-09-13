import 'express'

declare module 'express' {
  interface Request {
    correlationId?: string
  }
}

export enum TransactionType {
  INCOME = 'INCOME',
  SPEND = 'SPEND',
  REQUEST = 'REQUEST'
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}
