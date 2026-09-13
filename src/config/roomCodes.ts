const VALID_ROOM_CODES = ['TRAINING01', 'TRAINING02', 'DEMO001']

export function isValidRoomCode(code: string): boolean {
  return VALID_ROOM_CODES.includes(code.toUpperCase())
}

export function getValidRoomCodes(): string[] {
  return [...VALID_ROOM_CODES]
}