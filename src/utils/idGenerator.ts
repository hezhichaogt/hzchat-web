//
// Unique ID generation utility module.
//

export const generateTempID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  throw new Error('ID generation failed: crypto.randomUUID is not supported in this environment.')
}
